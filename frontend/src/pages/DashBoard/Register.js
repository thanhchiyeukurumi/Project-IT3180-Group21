import "./style_register.css";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// --- Hàm tiện ích cho việc xác thực ---
const validateInput = (name, value, allValues = {}) => {
    switch (name) {
        case 'name':
            if (!value) return "Họ và tên không được để trống.";
            return "";
        case 'cic':
            if (!/^\d{10}$/.test(value)) return "CCCD phải có đúng 10 chữ số.";
            return "";
        case 'contact_phone':
            if (!/^0\d{9}$/.test(value)) return "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
            return "";
        case 'dob':
            if (new Date(value) > new Date()) return "Ngày sinh không hợp lệ.";
            return "";
        case 'endTemporary':
            if (allValues.status !== "Thường trú" && new Date(value) <= new Date(allValues.movingIn)) {
                return "Ngày kết thúc phải sau ngày bắt đầu.";
            }
            return "";
        default:
            return "";
    }
};


function Register() {
    const navigate = useNavigate();
    const [remains, setRemains] = useState([]); // Danh sách các căn hộ
    const [errors, setErrors] = useState({}); // State để lưu các lỗi validation
    const [isSubmitting, setIsSubmitting] = useState(false); // State để tránh submit nhiều lần

    const [personalInfor, setPersonalInfor] = useState({
        name: "",
        cic: "",
        dob: "",
        nation: "Việt Nam", // Giá trị mặc định hợp lý
        occupation: "",
        gender: "Nam",
        hometown: "",
        ethnicity: "Kinh", // Giá trị mặc định hợp lý
        contact_phone: "",
        status: "Thường trú",
        movingIn: "",
        endTemporary: ""
    });

    const [householdInfor, setHouseholdInfor] = useState({
        number: "",
        floor: "",
        relationToOwner: "Chủ nhà"
    });

    // Tối ưu #1: Chỉ gọi API một lần khi component được mount
    useEffect(() => {
        const fetchRemains = async () => {
            try {
                const res = await fetch("http://localhost:8386/apartments/api/v1/remains");
                if (!res.ok) throw new Error("Failed to fetch apartment data");
                const data = await res.json();
                setRemains(data);
            } catch (error) {
                console.error("API Error:", error);
                alert("Không thể tải dữ liệu căn hộ. Vui lòng thử lại.");
            }
        };
        fetchRemains();
    }, []); // Dependency rỗng để chỉ chạy 1 lần

    // Tối ưu #2: Dùng `useMemo` để tính toán danh sách tầng và phòng
    // Logic này chỉ chạy lại khi dependency thay đổi, hiệu quả hơn `useEffect`
    const filteredData = useMemo(() => {
        if (householdInfor.relationToOwner === 'Chủ nhà') {
            return remains?.filter(apt => apt.household_id === null) || [];
        }
        return remains?.filter(apt => apt.household_id !== null) || [];
    }, [householdInfor.relationToOwner, remains]);

    const availableFloors = useMemo(() => {
        const floors = filteredData.map(apt => apt.floor);
        return [...new Set(floors)]; // Trả về mảng dữ liệu thô
    }, [filteredData]);

    const availableRooms = useMemo(() => {
        return filteredData
            .filter(apt => apt.floor === householdInfor.floor)
            .map(apt => apt.number); // Trả về mảng dữ liệu thô
    }, [householdInfor.floor, filteredData]);

    // Tối ưu #3: Gộp các hàm `handle...Change` và thêm validation ngay khi nhập
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
    
        // Xác định state nào cần cập nhật
        if (Object.keys(personalInfor).includes(name)) {
            setPersonalInfor(prev => {
                const newInfo = { ...prev, [name]: value };
                // Xác thực trường vừa thay đổi
                const error = validateInput(name, value, newInfo);
                setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
                return newInfo;
            });
        } else {
            // SỬA LỖI VÀ TỐI ƯU Ở ĐÂY
            setHouseholdInfor(prev => {
                // Bắt đầu với state mới dựa trên giá trị được thay đổi
                const newState = { ...prev, [name]: value };
    
                // Nếu thay đổi "Quan hệ với chủ hộ", reset cả tầng và phòng
                if (name === "relationToOwner") {
                    newState.floor = "";
                    newState.number = "";
                }
    
                // Nếu thay đổi "Tầng", chỉ reset phòng
                if (name === "floor") {
                    newState.number = "";
                }
    
                // Trả về đối tượng state cuối cùng sau khi đã xử lý
                return newState;
            });
        }
    }, [personalInfor]); // Dependency không đổi

    // Tối ưu #4: Dùng async/await và try/catch cho `handleSubmit`
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // --- Xác thực toàn bộ form trước khi gửi ---
        let formIsValid = true;
        const newErrors = {};
        const allData = { ...personalInfor, ...householdInfor };

        // Kiểm tra các trường bắt buộc
        Object.keys(allData).forEach(key => {
            const error = validateInput(key, allData[key], allData);
            if(error) {
                newErrors[key] = error;
                formIsValid = false;
            }
        });
        
        // Kiểm tra các trường có điều kiện
        if (personalInfor.status !== 'Thường trú' && !personalInfor.endTemporary) {
            newErrors.endTemporary = "Ngày kết thúc không được để trống.";
            formIsValid = false;
        }

        setErrors(newErrors);
        if (!formIsValid) {
            alert("Vui lòng kiểm tra lại các thông tin đã nhập.");
            setIsSubmitting(false);
            return;
        }
        
        try {
            // 1. Tạo Person
            const personRes = await fetch("http://localhost:8386/person/api/v1/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(personalInfor)
            });

            const personData = await personRes.json();
            if (!personRes.ok || personData.message !== 'Success') {
                throw new Error(personData.message || "Tạo thông tin cá nhân thất bại.");
            }

            // 2. Tạo hoặc thêm vào Household
            const isOwner = householdInfor.relationToOwner === "Chủ nhà";
            const url = isOwner
                ? "http://localhost:8386/household/api/v1/create"
                : "http://localhost:8386/household/api/v1/addMember";

            const householdPayload = {
                ...householdInfor,
                id: personData.person, // Lấy id từ response trước đó
                contact_phone: personalInfor.contact_phone
            };

            const householdRes = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(householdPayload)
            });

            const householdData = await householdRes.json();
            if (!householdRes.ok || householdData.message !== 'Success') {
                throw new Error(householdData.message || "Thêm vào hộ khẩu thất bại.");
            }

            // 3. Xử lý khi thành công
            if (isOwner) {
                localStorage.removeItem(`households_page_${householdData.lastPage}`);
                localStorage.removeItem("totalHousehold");
            }
            alert("Đăng ký thành công!");
            navigate(`/household_infor?household_id=${householdData.household}`);

        } catch (error) {
            console.error("Submit Error:", error);
            alert(`Đã có lỗi xảy ra: ${error.message}`);
        } finally {
            setIsSubmitting(false); // Luôn set lại_kể cả khi lỗi
        }
    };

    // Tối ưu #5: Loại bỏ state `status` không cần thiết
    const isTemporaryStay = personalInfor.status !== "Thường trú";

    return (
        <>
            <div className="details">
                <div className="recentCt page2">
                    <div className="cardHeader">
                        <h2>Đăng kí cư dân</h2>
                    </div>
                    {/* Sử dụng novalidate để tắt validation mặc định của trình duyệt */}
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form first">
                            <span id="title">Thông tin cá nhân</span>
                            <div className="fields">
                                {/* Thêm hiển thị lỗi và các thuộc tính maxLength */}
                                <div className="input-fields">
                                    <label htmlFor="name">Họ và tên</label>
                                    <input id="name" name="name" type="text" value={personalInfor.name} onChange={handleChange} required />
                                    {errors.name && <small className="error-text">{errors.name}</small>}
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="cic">CCCD</label>
                                    <input id="cic" name="cic" type="text" value={personalInfor.cic} onChange={handleChange} required maxLength="12" />
                                    {errors.cic && <small className="error-text">{errors.cic}</small>}
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="dob">Ngày sinh</label>
                                    <input id="dob" name="dob" type="date" value={personalInfor.dob} onChange={handleChange} required />
                                    {errors.dob && <small className="error-text">{errors.dob}</small>}
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="nation">Quốc tịch</label>
                                    <input id="nation" name="nation" type="text" value={personalInfor.nation} onChange={handleChange} required />
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="occupation">Nghề nghiệp</label>
                                    <input id="occupation" name="occupation" type="text" value={personalInfor.occupation} onChange={handleChange} required />
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="gender">Giới tính</label>
                                    <select name="gender" id="gender" value={personalInfor.gender} onChange={handleChange}>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="hometown">Quê quán</label>
                                    <input id="hometown" name="hometown" type="text" value={personalInfor.hometown} onChange={handleChange} required />
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="ethnicity">Dân tộc</label>
                                    <input id="ethnicity" name="ethnicity" type="text" value={personalInfor.ethnicity} onChange={handleChange} required />
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="contact_phone">Số điện thoại</label>
                                    <input id="contact_phone" name="contact_phone" type="tel" value={personalInfor.contact_phone} onChange={handleChange} required maxLength="10" />
                                     {errors.contact_phone && <small className="error-text">{errors.contact_phone}</small>}
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div className="form second">
                            <span id="title">Thông tin căn hộ</span>
                            <div className="fields">
                                <div className="input-fields">
                                    <label htmlFor="relationToOwner">Quan hệ với chủ hộ</label>
                                    <select id="relationToOwner" name="relationToOwner" value={householdInfor.relationToOwner} onChange={handleChange}>
                                        <option value="Chủ nhà">Chủ nhà</option>
                                        <option value="Con cái">Con cái</option>
                                        <option value="Vợ chồng">Vợ chồng</option>
                                        <option value="Bố mẹ">Bố mẹ</option>
                                        <option value="Họ hàng">Họ hàng</option>
                                        <option value="Anh em">Anh em</option>
                                    </select>
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="floor">Chọn tầng</label>
                                    <select id="floor" name="floor" value={householdInfor.floor} onChange={handleChange} required>
                                        <option value="">-- Chọn tầng --</option>
                                        {availableFloors.map(fl => <option key={fl} value={fl}>{fl}</option>)}
                                    </select>
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="number">Chọn phòng</label>
                                    <select id="number" name="number" value={householdInfor.number} onChange={handleChange} required disabled={!householdInfor.floor}>
                                        <option value="">-- Chọn phòng --</option>
                                        {availableRooms.map(room => <option key={room} value={room}>{room}</option>)}
                                    </select>
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="status">Trạng thái</label>
                                    <select id="status" name="status" value={personalInfor.status} onChange={handleChange}>
                                        <option value="Thường trú">Thường trú</option>
                                        <option value="Tạm trú">Tạm trú</option>
                                        <option value="Tạm vắng">Tạm vắng</option>
                                    </select>
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="movingIn">Từ ngày</label>
                                    <input id="movingIn" name="movingIn" type="date" value={personalInfor.movingIn} onChange={handleChange} required={isTemporaryStay} disabled={!isTemporaryStay}/>
                                </div>
                                <div className="input-fields">
                                    <label htmlFor="endTemporary">Đến ngày</label>
                                    <input id="endTemporary" name="endTemporary" type="date" value={personalInfor.endTemporary} onChange={handleChange} required={isTemporaryStay} disabled={!isTemporaryStay} />
                                     {errors.endTemporary && <small className="error-text">{errors.endTemporary}</small>}
                                </div>
                            </div>
                        </div>
                        <div className="buttons">
                            <button className="submitBtn" type="submit" disabled={isSubmitting}>
                                <span className="buttonSm">{isSubmitting ? "Đang gửi..." : "Submit"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Register;
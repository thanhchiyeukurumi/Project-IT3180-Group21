import "./asset/css/material-design-iconic-font.min.css"
import "./asset/css/style.css"
import { useState } from "react";
import { FcOk } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { changePassword } from "../../actions";
import { message } from "antd";

function Password(){
  const [oldPassword, setOldPassword] = useState("");
  const navigate = useNavigate();

  const handleOldPassword = (e) => {
    e.preventDefault();
    setOldPassword(e.target.value);
  }

  //Process new password;
  const minLength = /.{8,}/; 
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/; 
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  const hasNumber = /\d/;

  const [isMinLengthValid, setMinLengthValid] = useState(false);
  const [isHasUpperCase, setIsHasUpperCase] = useState(false);
  const [isHasLowerCase, setIsHasLowerCase] = useState(false);
  const [isHasSpecialChar, setIsHasSpecialChar] = useState(false);
  const [isHasNumber, setIsHasNumber] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [isNewValid, setIsNewValid] = useState(false);
  const [checkClass, setCheckClass] = useState(false);

  const validateNewPassword = (password) => {
    setMinLengthValid(minLength.test(password));
    setIsHasUpperCase(hasUpperCase.test(password));
    setIsHasLowerCase(hasLowerCase.test(password));
    setIsHasSpecialChar(hasSpecialChar.test(password));
    setIsHasNumber(hasNumber.test(password));

    return minLength.test(password) &&
    hasUpperCase.test(password) &&
    hasLowerCase.test(password) &&
    hasSpecialChar.test(password) &&
    hasNumber.test(password);
  }
  
  const handleNewPassword = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setNewPassword(value);
    setIsNewValid(validateNewPassword(value));
    setCheckClass(validateNewPassword(value) ? "correct" : "incorrect");
  }

  //Process Confirmed Password
  const [check, setCheck] = useState(false);

  const handleConfirmedPassword = (e) => {
    e.preventDefault();
    const value = e.target.value;
    if (value === newPassword){
      setCheck(true);
    }
    console.log(value);
  }

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isNewValid) {
      message.error("Mật khẩu mới không hợp lệ. Vui lòng kiểm tra lại yêu cầu.");
      return;
    }
    if (!check) {
      message.error("Mật khẩu xác nhận không khớp.");
      return;
    }
    dispatch(changePassword(oldPassword, newPassword, navigate));
  };

  return(
    <>
      <div className="password-main">
        <section className="change-password">
          <div className="password-container">
            <div className="password-content">
              <div className="password-form">
                  <h2 className="password-form-title">Đổi mật khẩu</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <div className="password-input-field old-password">
                          <label htmlFor="old-password">Mật khẩu cũ</label>
                          <input type="password" name="old-password" id="old-password" placeholder="Mật khẩu cũ" onChange={handleOldPassword}/>
                        </div>
                        <div className="password-input-field">
                          <label htmlFor="new-password">Mật khẩu mới</label>
                          {
                            isNewValid && <FcOk/>
                          }
                          <input type="password" name="new-password" id="new-password" placeholder="Mật khẩu mới" onChange={handleNewPassword} className={`${checkClass}`}/>
                        </div> 
                        <div className="password-require">
                          <h5>Yêu cầu</h5>
                          <ul>
                            <li className={isMinLengthValid ? "valid" : "invalid"}>Có ít nhất 8 kí tự</li>
                            <li className={isHasUpperCase ? "valid" : "invalid"}>Có ít nhất 1 kí tự viết hoa</li>
                            <li className={isHasLowerCase ? "valid" : "invalid"}>Có ít nhất 1 kí tự viết thường</li>
                            <li className={isHasSpecialChar ? "valid" : "invalid"}>Có ít nhất 1 kí tự đặc biệt</li>
                            <li className={isHasNumber ? "valid" : "invalid"}>Có số</li>
                          </ul>
                        </div>
                        <div className="password-input-field">
                          <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                          {
                            check && <FcOk/>
                          }
                          <input type="password" name="confirm-password" id="confirm-password" placeholder="Xác nhận mật khẩu" onChange={handleConfirmedPassword} className={check ? "correct" : "incorrect"}/>
                        </div> 
                        <div className="form-group form-button">
                            <input type="submit" name="change-password" id="change-password" className="form-submit" value="Đổi mật khẩu"/>
                        </div>
                      </div>
                    </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Password;
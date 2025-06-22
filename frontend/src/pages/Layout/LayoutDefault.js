import "./assets/css/style.scss"
import "https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
import customer01 from "./assets/imgs/customer01.jpg"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useRef, useEffect, useState } from "react"
import { checkAuth } from "../../actions"

function LayoutDefault(){
    const navigationRef = useRef(null);
    const mainRef = useRef(null);
    const userMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        if(checkAuth())
            navigate("/login");
        
        // Set default collapsed state
        if (navigationRef.current && mainRef.current) {
            navigationRef.current.classList.add("active");
            mainRef.current.classList.add("active");
        }

        // Handle click outside
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mainRef]);

    const handleClick = () => {
        if (navigationRef.current && mainRef.current) {
          navigationRef.current.classList.toggle("active");
          mainRef.current.classList.toggle("active");
        }
    };

    const logout = () => {
        document.cookie = "token=; path=/; max-age=0";
        navigate("/");
    }

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    }

    return (
    <>
      <div className="layout-default">
        <div className="layout-default__sidebar">
          <div className="layout-default__sidebar--container">
            <div className="layout-default__sidebar--navigation" ref={navigationRef}>
              <ul>
              <li>
                    <Link to="dashboard">
                        <span className="icon">
                            <ion-icon name="business-sharp"></ion-icon>
                        </span>
                        <span className="title">BLUEMOON</span>
                    </Link>
                </li>

                {/* <li>
                    <Link to="dashboard">
                        <span className="icon">
                            <ion-icon name="home-outline"></ion-icon>
                        </span>
                        <span className="title">Trang chủ</span>
                    </Link>
                </li> */}

                <li className={location.pathname === "/dashboard" ? "active" : ""}>
                    <Link to="dashboard">
                        <span className="icon">
                            <ion-icon name="people-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý căn hộ và cư dân</span>
                    </Link>
                </li>
                <li className={location.pathname === "/vehicle_manage" ? "active" : ""}>
                    <Link to="/vehicle_manage">
                        <span className="icon">
                            <ion-icon name="car-sport-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý phương tiện</span>
                    </Link>
                </li>
                <li className={location.pathname === "/fee_manage" ? "active" : ""}>
                    <Link to="/fee_manage">
                        <span className="icon">
                            <ion-icon name="cash-outline"></ion-icon>
                        </span>
                        <span className="title">Quản lý thu phí chung cư</span>
                    </Link>
                </li>

                <li className={location.pathname === "/stats" ? "active" : ""}>
                    <Link to="stats">
                        <span className="icon">
                            <ion-icon name="stats-chart-outline"></ion-icon>
                        </span>
                        <span className="title">Thống kê</span>
                    </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
            {/* ----------------------Main ---------------------- */}
        <div className="layout-default__main" ref={mainRef}>
            <div className="layout-default__main--topbar">
                <div className="layout-default__main--toggle" onClick={handleClick}>
                    <ion-icon name="menu-outline"></ion-icon>
                </div>

                <div className="layout-default__main--user-container" ref={userMenuRef}>
                    <div className="layout-default__main--user" onClick={toggleUserMenu}>
                        <img src={customer01} alt=""/>
                        <span className="user-name">Nguyễn Văn A</span>
                    </div>
                    {showUserMenu && (
                        <div className="user-dropdown">
                            <Link to="/profile" className="dropdown-item">
                                <ion-icon name="person-outline"></ion-icon>
                                <span>Trang cá nhân</span>
                            </Link>
                            <Link to="/password" className="dropdown-item">
                                <ion-icon name="lock-closed-outline"></ion-icon>
                                <span>Đổi mật khẩu</span>
                            </Link>
                            <div className="dropdown-item" onClick={logout}>
                                <ion-icon name="log-out-outline"></ion-icon>
                                <span>Đăng xuất</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Outlet/>
        </div>
      </div>
    </>
  )
}

export default LayoutDefault
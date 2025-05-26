import { message } from "antd";

export const changePassword = (oldPassword, newPassword, navigate) => {
  return async (dispatch) => {
    dispatch({ type: "CHANGE_PASSWORD_REQUEST" });

    try {
      const response = await fetch("http://localhost:8386/auth/api/v1/changePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword
        }),
        credentials: "include"
      });

      const data = await response.json();

      if (data.message === "Password updated") {
        dispatch({ type: "CHANGE_PASSWORD_SUCCESS", payload: data });
        message.success("Đổi mật khẩu thành công!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        dispatch({ type: "CHANGE_PASSWORD_FAILURE", error: data.message });
        message.error(data.message);
      }
    } catch (error) {
      dispatch({ type: "CHANGE_PASSWORD_FAILURE", error: "Có lỗi xảy ra khi thay đổi mật khẩu" });
      message.error("Có lỗi xảy ra khi thay đổi mật khẩu");
    }
  };
};

/**
 * 目标1：验证码登录
 * 1.1 在 utils/request.js 配置 axios 请求基地址
 * 1.2 收集手机号和验证码数据
 * 1.3 基于 axios 调用验证码登录接口
 * 1.4 使用 Bootstrap 的 Alert 警告框反馈结果给用户
 */

document
  .querySelector(".btn")
  .addEventListener("click", async function (event) {
    //获取表单
    const from = document.querySelector(".login-form");
    const data = serialize(from, {
      hash: true,
      empty: true,
    });
    //发送请求
    try {
      const result = await axios({
        url: "/v1_0/authorizations",
        method: "post",
        data,
      });
      localStorage.setItem("token", result.data.token);
      setTimeout(() => {
        location.href = "../content/index.html";
      }, 1500);
      // console.log(result.data.data.token);
      // console.log(result);
      myAlert(true, "登陆成功");
    } catch (error) {
      console.dir(error);
      myAlert(false, error.response.data.message);
      // console.log(error.response.data.message);
    }
  });

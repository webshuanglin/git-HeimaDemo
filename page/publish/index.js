/**
 * 目标1：设置频道下拉菜单
 *  1.1 获取频道列表数据
 *  1.2 展示到下拉菜单中
 */

async function setChannel() {
  const result = await axios({
    url: "/v1_0/channels",
    method: "get",
  });
  document.querySelector("#channel_id").innerHTML =
    '<option value="" selected>请选择文章频道</option>' +
    result.data.channels
      .map((obj) => {
        return `<option value=${obj.id}>${obj.name}</option>`;
      })
      .join("");
}
setChannel();
// document
//   .querySelector("#channel_id")
//   .addEventListener("change", function (event) {
//     console.log(event.target.value);
//   });

/**
 * 目标2：文章封面设置
 *  2.1 准备标签结构和样式
 *  2.2 选择文件并保存在 FormData
 *  2.3 单独上传图片并得到图片 URL 网址
 *  2.4 回显并切换 img 标签展示（隐藏 + 号上传标签）
 */
document
  .querySelector(".img-file")
  .addEventListener("change", async function (event) {
    const fd = new FormData();
    fd.append("image", event.target.files[0]);
    const result = await axios({
      url: "/v1_0/upload",
      method: "post",
      data: fd,
    });
    // console.log(result.data.url);
    // localStorage.setItem("image", result.data.url);
    document.querySelector(".rounded").src = result.data.url;
    document.querySelector(".rounded").classList.add("show");
    document.querySelector(".place").classList.add("hide");
  });

document.querySelector(".rounded").addEventListener("click", function (event) {
  document.querySelector(".img-file").click();
});
// const image = localStorage.getItem("image");

/**
 * 目标3：发布文章保存
 *  3.1 基于 form-serialize 插件收集表单数据对象
 *  3.2 基于 axios 提交到服务器保存
 *  3.3 调用 Alert 警告框反馈结果给用户
 *  3.4 重置表单并跳转到列表页
 */
document
  .querySelector(".send")
  .addEventListener("click", async function (event) {
    if (!document.querySelector("[name=id]").value) {
      if (confirm("确认提交表单")) {
        const from = document.querySelector(".art-form");
        const data = serialize(from, {
          hash: true,
          empty: true,
        });
        delete data.id;
        data.cover = {
          type: 1,
          images: [document.querySelector(".rounded").src],
        };
        // console.log(data);
        try {
          const result = await axios({
            url: "/v1_0/mp/articles",
            method: "post",
            data,
          });
          // console.log(result.data.id);
          myAlert(true, "文章发布成功");
          from.reset();
          //手动清空图片和富文本
          document.querySelector(".rounded").src = "";
          document.querySelector(".rounded").classList.remove("show");
          document.querySelector(".place").classList.remove("hide");
          editor.setHtml("");
          setTimeout(() => {
            location.href = "../content/index.html";
          }, 1500);
        } catch (error) {
          console.dir(error);
          myAlert(false, error.response.data.message);
        }
      }
    }
  });

/**
 * 目标4：编辑-回显文章
 *  4.1 页面跳转传参（URL 查询参数方式）
 *  4.2 发布文章页面接收参数判断（共用同一套表单）
 *  4.3 修改标题和按钮文字
 *  4.4 获取文章详情数据并回显表单
 */
(async function () {
  const paramsStr = location.search;
  const params = new URLSearchParams(paramsStr);
  let id = 0;
  params.forEach((value, key) => {
    if (key === "id") {
      id = value;
    }
  });
  // console.log(id);
  if (id !== 0) {
    //改变交互文字
    document.querySelector(".title span").textContent = "修改文章";
    document.querySelector(".send").textContent = "修改";
    const result = await axios({
      url: `/v1_0/mp/articles/${id}`,
      method: "get",
    });
    // console.log(result);
    //进行数据回显
    //组织数据对象
    const dataObj = {
      channel_id: result.data.channel_id,
      title: result.data.title,
      rounded: result.data.cover.images[0],
      content: result.data.content,
      id: result.data.id,
    };
    // console.log(dataObj);
    Object.keys(dataObj).forEach((key) => {
      if (key === "rounded") {
        if (dataObj[key]) {
          document.querySelector(".rounded").src = dataObj[key];
          document.querySelector(".rounded").classList.add("show");
          document.querySelector(".place").classList.add("hide");
        }
      } else if (key === "content") {
        editor.setHtml(dataObj[key]);
      } else {
        document.getElementsByName(`${key}`)[0].value = dataObj[key];
      }
    });
  }
})();

/**
 * 目标5：编辑-保存文章
 *  5.1 判断按钮文字，区分业务（因为共用一套表单）
 *  5.2 调用编辑文章接口，保存信息到服务器
 *  5.3 基于 Alert 反馈结果消息给用户
 */
document
  .querySelector(".send")
  .addEventListener("click", async function (event) {
    const id = document.querySelector("[name=id]").value;
    if (id) {
      // console.log(1);
      const from = document.querySelector(".art-form");
      const data = serialize(from, {
        hash: true,
        empty: true,
      });
      const src = document.querySelector(".rounded").src;
      data.cover = {
        type: +`${src ? 1 : 0}`,
        images: [src],
      };
      try {
        const result = await axios({
          url: `/v1_0/mp/articles/${id}`,
          method: "put",
          data,
        });
        myAlert(true, "修改成功");
        setTimeout(() => {
          location.href = "../content/index.html";
        }, 2000);
      } catch (error) {
        console.dir(error);
        myAlert(false, error.message);
      }
    }
  });

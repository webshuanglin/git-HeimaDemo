/**
 * 目标1：获取文章列表并展示
 *  1.1 准备查询参数对象
 *  1.2 获取文章列表数据
 *  1.3 展示到指定的标签结构中
 */
const queryobj = {
  status: "",
  channel_id: "",
  page: "1",
  per_page: "2",
};
var totalPage;
async function getList() {
  const result = await axios({
    url: "/v1_0/mp/articles",
    method: "get",
    params: queryobj,
  });
  // console.log(result.data.results);
  // console.log(result);
  //默认总页数
  totalPage = result.data.total_count;
  document.querySelector(".total-count").textContent = `共 ${totalPage} 条`;
  const tbodyHtml = result.data.results
    .map((obj) => {
      return `<tr>
        <td>
          <img
            src="${
              obj.cover.type === 0
                ? `https://img2.baidu.com/it/u=2640406343,1419332367&amp;fm=253&amp;fmt=auto&amp;app=138&amp;f=JPEG?w=708&amp;h=500`
                : obj.cover.images[0]
            }"
            alt="">
        </td>
        <td>${obj.title}</td>
        <td>
            ${
              obj.status === 1
                ? `<span class="badge text-bg-primary">待审核</span>`
                : `<span class="badge text-bg-success">审核通过</span>`
            }
        </td>
        <td>
          <span>${obj.pubdate}</span>
        </td>
        <td>
          <span>${obj.read_count}</span>
        </td>
        <td>
          <span>${obj.comment_count}</span>
        </td>
        <td>
          <span>${obj.like_count}</span>
        </td>
        <td data-id=${obj.id}>
          <i class="bi bi-pencil-square edit"></i>
          <i class="bi bi-trash3 del"></i>
        </td>
      </tr>`;
    })
    .join("");
  document.querySelector(".art-list").innerHTML = tbodyHtml;
  document.querySelector(
    ".page-item.page-now"
  ).textContent = `第 ${queryobj.page} 页`;
}
getList();

/**
 * 目标2：筛选文章列表
 *  2.1 设置频道列表数据
 *  2.2 监听筛选条件改变，保存查询信息到查询参数对象
 *  2.3 点击筛选时，传递查询参数对象到服务器
 *  2.4 获取匹配数据，覆盖到页面展示
 */
async function setChannel() {
  const result = await axios({
    url: "/v1_0/channels",
    method: "get",
  });
  document.querySelector(".form-select").innerHTML =
    '<option value="" selected>请选择文章频道</option>' +
    result.data.channels
      .map((obj) => {
        return `<option value=${obj.id}>${obj.name}</option>`;
      })
      .join("");
}
setChannel();

//监听条件的修改
// document.querySelector(".sel-btn").addEventListener("click", function (event) {
//   const form = document.querySelector(".sel-form");
//   const data = serialize(form, { hash: true, empty: true });
//   // (queryobj  = {...data});
//   for (const key in data) {
//     queryobj[key] = data[key];
//   }
//   getList();
//   form.reset();
// });
//老师的方法
//先是按钮
document.querySelectorAll(".form-check-input").forEach((elenment) => {
  elenment.addEventListener("change", function (event) {
    queryobj.status = event.target.value;
  });
});
//然后是列表
document
  .querySelector(".form-select")
  .addEventListener("change", function (event) {
    queryobj.channel_id = event.target.value;
  });
document.querySelector(".sel-btn").addEventListener("click", function (event) {
  getList();
});
/**
 * 目标3：分页功能
 *  3.1 保存并设置文章总条数
 *  3.2 点击下一页，做临界值判断，并切换页码参数并请求最新数据
 *  3.3 点击上一页，做临界值判断，并切换页码参数并请求最新数据
 */
//默认页码
document.querySelector(
  ".page-item.page-now"
).textContent = `第 ${queryobj.page} 页`;

//分别设置事件函数
document.querySelector(".last").addEventListener("click", function (event) {
  if (queryobj.page > 1) {
    queryobj.page--;
    getList();
    // document.querySelector(
    //   ".page-item.page-now"
    // ).textContent = `第 ${queryobj.page} 页`;
  }
});
document.querySelector(".next").addEventListener("click", function (event) {
  if (queryobj.page < Math.ceil(totalPage / queryobj.per_page)) {
    queryobj.page++;
    getList();
    // document.querySelector(
    //   ".page-item.page-now"
    // ).textContent = `第 ${queryobj.page} 页`;
  }
});
/**
 * 目标4：删除功能
 *  4.1 关联文章 id 到删除图标
 *  4.2 点击删除时，获取文章 id
 *  4.3 调用删除接口，传递文章 id 到服务器
 *  4.4 重新获取文章列表，并覆盖展示
 *  4.5 删除最后一页的最后一条，需要自动向前翻页
 */

// 点击编辑时，获取文章 id，跳转到发布文章页面传递文章 id 过去
document
  .querySelector(".art-list")
  .addEventListener("click", async function (event) {
    if (event.target.classList.contains("del")) {
      const id = event.target.parentNode.dataset.id;
      // console.log(id);
      if (confirm("确认删除?")) {
        const result = await axios({
          url: `/v1_0/mp/articles/${id}`,
          method: "DELETE",
        });
        //判断最后一条数据
        if ((totalPage - 1) % 2 === 0 && queryobj.page > 1) {
          queryobj.page--;
        }
        getList();
        // document.querySelector(
        //   ".page-item.page-now"
        // ).textContent = `第 ${queryobj.page} 页`;
      }
    }
  });

//编辑功能
document
  .querySelector(".art-list")
  .addEventListener("click", async function (event) {
    if (event.target.classList.contains("edit")) {
      const id = event.target.parentNode.dataset.id;
      console.log(id);
      location.href = `../publish/index.html?id=${id}`;
    }
  });

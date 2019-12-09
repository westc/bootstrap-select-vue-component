$(function () {
  vueApp = new Vue({
    el: '#vueApp',
    data: {
      options: [1,2,3,4,5,6,7,8,9].map(x => ({ id: x, name: `Person #${x}`, sub: `no. ${x}` })),
      value1: 3,
      value2: undefined,
      value3: undefined,
      nullText: 'Please choose one...',
      liveSearch: true,
      actionsBox: true,
      showSubtext: false,
      list: ['hello', 'world']
    }
  });
});

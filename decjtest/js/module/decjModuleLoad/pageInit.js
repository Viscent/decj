define(['jquery','decj'],function(jQuery,decj){

  return {
    data:{
      article:{
        title:"Simplying front-end web dev with decj",
        author:"Viscent",
        link:""
      }
    },
    init:function(){
     var data=this.data.article;
     $('#title').html(data.title);
     $('#author').html(data.author);
    }
  };
});
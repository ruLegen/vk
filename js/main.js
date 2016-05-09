///доделать класс Post. Не все зн используются. Надо добавить atachmentImages. И сделать разбор принятыых данных где есть картинки и текст
var err;
var ownerId;    //id хозяина приложения  
var getData = undefined;
var isSlided = false;
var timeMenuSlide = 150;
var realMenuSize;
var docWidth = 800;
var link = "";
var typeOfPost;
var elementContent;
var sortedPosts = new Array();
var rawGetData = new Array();
var idOfCurrentUser = undefined;    //id пользователя
var countOfAllPosts= 0;
var displayedPosts = 0;

function Post(image, _postType, postId, postText, _isRepost) {
  this.img = image;
  this.imgDir = "imgs/";
  this.isRepost = _isRepost;
  this.getCssImg = function () {
    if (this.postType == undefined) {
      var str = "url(" + this.imgDir + this.img + ")";
      return str;
    }
    else {
      var str = "url(" + this.img + ")";
      return str;
    }

  }
  this.postType = _postType;
  this.id = postId;
  this.DOMcontent = "";
  this.text = postText;
  this.setImg = function () {
    if (this.postType == undefined)           //если у поста нету картинок то берем картинку с локального хранилища.
      $('#' + this.id).css("background-image", this.imgDir + this.img);
    else
      $('#' + this.id).css("background-image", "url(" + this.imgDir + this.img + ")");
  }
  this.atachmentsImages = new Array();
}


//////////////////////////Win_Load//////////////////////////////
$(window).ready(function () {
  VK.init(onOkInit(), onFaildInit(), '5.52');
 
  $('#btn').click(function () {
    menuSlide(20);
  });

  $('#start').click(function () {
    clearScr();
    if (isNaN(parseInt($("#count").val())) != true) var count = parseInt($("#count").val());   else {count = 20;$("#count").val(20)};
    if (isNaN(parseInt($("#offset").val())) != true) var offset = parseInt($("#offset").val()); else {offset = 0;$("#offset").val(0)};
    count < 0? count = -count:count = count;
    offset < 0? offset = -offset:offset = offset;
    if (isNaN(parseInt($("#idOfUSer").val())) != true) idOfCurrentUser = parseInt($("#idOfUSer").val()); else {idOfCurrentUser = ownerId;$("#idOfUSer").val("me");};
   
    getCountOfPosts(idOfCurrentUser);
    setTimeout(getAllPosts,200,count, offset,idOfCurrentUser)
   
    
  });

});
///////////////////////////////////////////////////////////////
function getAllPosts(_count,_offset,_id) {
  
  
  if(err)
  {
   $('#wait').css("background-image","url('imgs/error.png')");
   $('#wait').show();
   err = false;
   return false;
  }
  else{
    $('#wait').css("background-image","url('imgs/wait.gif')");
    $('#wait').show();
  }
  
  var countInTimer =0;
  var getCount = _count < 0? -_count:_count;
  _count < 0? _count *= -1:_count = _count;
  getCount > countOfAllPosts ? getCount = countOfAllPosts:getCount;
  getCount > 100 ? countInTimer = 100:countInTimer = getCount;
  
  var once = false;
  var offset = _offset;
  var iteration = Math.ceil(getCount / 100) -1;
  setTimeout(function _get() {
    if (getCount >= 100) { getCount = Math.abs(getCount - 100);} else { countInTimer = getCount; }
    VK.api('wall.get', { 'owner_id':_id,'count': countInTimer, "offset": offset }, function (data) {
      offset = parseInt(offset) + 100;
      rawGetData.push(data.response.items);
      console.log(rawGetData);
      console.log(iteration);
      if (iteration > 0) {
        setTimeout(_get, 500);
        iteration--;
      }
      if(iteration == 0 && !once) {displayPosts(rawGetData);$('#wait').hide();once = true;}
    });
  }, 500);
}

function displayPosts(rawData) {
  var t_data = Array.from(rawData);
  console.log(typeof (t_data));
  var data = new Array;
  t_data.forEach(function (item, i, t_data) {
    item.forEach(function (item, i, t_data) {
      data.push(item);
    });
  });

  $('#postCount').html("All posts: " + countOfAllPosts);
  data.forEach(function (element, i, data) {

    var typeOfPost = "text"; //тип поста(текст видео картинка)
    var elementContent;
    var text; //текст поста
    var atchImg = new Array(); //картинки если их больше 1
    var post = undefined;
    var postId = element.id; // id posta
    var atachCount = undefined;
    var isRepost = false;
    var sortRules = getSortRules();

    try {       //обработка Своих Записей.
      typeOfPost = element.attachments['0'].type;
      elementContent = element.attachments['0'];
      if (element.attachments.length != undefined) atachCount = element.attachments.length;
      switch (typeOfPost) {
        case 'video': link = elementContent.video.photo_130; break;
        case 'photo': link = elementContent.photo.photo_130; break;
        case 'doc': link = "imgs/doc.png"; break;
        case 'link': link = elementContent.link.photo.photo_130; break;
        case 'audio': link = "imgs/audio.png"; break;
        case 'note': link = "imgs/note.png"; break;
        case 'poll': link = "imgs/poll.png"; break;
        default: link = "imgs/unknow.png"; break;
      }
    } catch (error) { // Если пост является репостом или текстом
      try {
        var elementRoot = element.copy_history['0'].attachments['0'];
        typeOfPost = elementRoot.type;
        switch (typeOfPost) {
          case 'video': link = elementRoot.video.photo_130; break;
          case 'photo': link = elementRoot.photo.photo_130; break;
          case 'doc': link = "imgs/doc.png"; break;
          case 'link': link = elementRoot.link.photo.photo_130; break;
          case 'audio': link = "imgs/audio.png"; break;
          case 'note': link = "imgs/note.png"; break;
          case 'poll': link = "imgs/poll.png"; break;
          default: link = "imgs/unknow.png"; break;
        }
        isRepost = true;
        //if(element.copy_history['0'].atachments.length != undefined) atachCount = element.copy_history['0'].atachments.length;
      } catch (error) {

        link = "txt.png";
        console.log(error);  // 2 le catch is no cool
      }
    }

    post = new Post(link, typeOfPost, postId, text, isRepost);
    sortedPosts.push(post);
   if(sort(sortRules,typeOfPost))
   {
      createPost(post);
      displayedPosts++;
   }
    // console.log(post.postType + " " + post.getCssImg() + " " + post.id + " " + atachCount);
    if (i == data.length - 1) {
      //при последенем элементе задаем всем собития клика
      $('#postCountDislpayed').html("On screen " + displayedPosts);
      
      $('.post').on('click', function () {
        if (idOfCurrentUser > 0)
          var openLink = "http://vk.com/id" + idOfCurrentUser + "?w=wall" + idOfCurrentUser + '_' + this.getAttribute('id');
        else
          var openLink = "http://vk.com/wall" + idOfCurrentUser + "?own=1&w=wall" + idOfCurrentUser + "_" + this.getAttribute('id');
        window.open(openLink, '_blank');
      });
      $(".post").on("contextmenu", function (event) {
        var x = event.clientX;
        var y = event.clientY;
        var postContentWidth = parseInt($('#postContent').css("width"));
        var postContentLeft = $('#postContent').position().left;

        if (x > (postContentLeft + postContentWidth) / 2) {
          showAltMenu(this, x - 75, y);
        }
        if (x < (postContentLeft + postContentWidth) / 2) {
          showAltMenu(this, x, y);
        }
        console.log(x + "  " + y);
      });

      if (i % 100 == 0) {
        setTimeout(function () { }, 1090);
      }
    }
  });
}



function createPost(_Post) {
  var createdPost = $('<div>').appendTo('#Posts').attr({ "class": "post", "id": _Post.id,"typeOfPost":_Post.postType,"isRepost": _Post.isRepost});
  createdPost.css("background-image", _Post.getCssImg().toString());
  var postChild = $("<div>").appendTo(createdPost).attr({"id":"num"});
  postChild.html(_Post.id);


}
function clearScr() {
  $('.post').remove();
  sortedPosts = new Array();
  rawGetData = new Array();
  displayedPosts = 0;
}

function menuSlide(maxSlide) {
  isSlided = !isSlided;
  if (!isSlided) {
    $('#leftMenu').animate({
      width: maxSlide + "%",
    }, timeMenuSlide);

    $('#postContent').animate({
      width: 100 - maxSlide + "%",
    }, timeMenuSlide);
  }
  else {
	   $('#leftMenu').animate({
      width: realMenuSize + "%",
    }, timeMenuSlide);
	   $('#postContent').animate({
      width: (100 - realMenuSize) + "%",
    }, timeMenuSlide);
  }
}

function varInit() {

  realMenuSize = ($('#leftMenu').width() / docWidth) * 100; //получаем ширину в процентах
  menuSlide(20);
  $('#postCount').html("All posts: "+countOfAllPosts);
  $('#offset').val("offset");
  $('#count').val("count");
  $('#idOfUSer').val("user's id");
  $("#tab2").hide();

  $('.toTab').on('click',function() {
    var tab = parseInt($(this).val());
    openTab(tab);
  });
  $('#getID').on("click",function(){getID()});
}

function onOkInit() {
  varInit();
  getCountOfPosts('');
  getUserId();

}

function onFaildInit() {

}

function getCountOfPosts(_id) {
  VK.api('wall.get', { "owner_id": _id }, function (data) {
    try {
      countOfAllPosts = data.response.count;
    
    }
    catch (error) {
      try {
        countOfAllPosts = data.response['0'];
      
      }
      catch (error) {
        alert(data.error.error_msg);
       err = true;
      }
      //console.log(data);      
    }
  });
  
}

function getUserId() {
  VK.api('users.get', function (data) {
    if (data.response != undefined) {
      idOfCurrentUser = data.response['0'].uid;
      ownerId = idOfCurrentUser;
    }
    else {
      getUserId();
    }
  });
}


function changeIconSize(val) {
  var t_val = parseInt(val);
  t_val  = t_val <= 0? t_val = 1: t_val = t_val;
  
  var allposts = Array.from($('.post'));
  
  allposts.forEach(function(item,i,allposts) {
    var thisWidth = parseInt($(item).css("width"));
    var thisHeight = thisWidth;
    
    $(item).css({"width": t_val,"height":t_val});
  });
}

function showAltMenu(item,x,y)
{
         var postId = parseInt($(item).attr("id"));
          $('altmenu').hide();
          $('altmenu').css({"left":x,"top":y});
          $('#type').html("Type : "+ $(item).attr("typeofpost"));
          $('#repost').html("Repost? : "+ $(item).attr("isrepost"));
          $('altmenu').show(200);
          $(".element").unbind();
          $(".element").on('click', function () {
            $('altmenu').hide();
          });
        $('body').on('mousedown',function () {
          $('altmenu').hide();
        });
}

function openTab(tabNum) {
  var tabs = Array.from($(".tab"));
  tabs.forEach(function(item,i,tabs) {
    $(item).hide();
  });
  $('#tab'+tabNum).fadeIn(100);
}

function getID() {
  var textbox = $('#url');
  var searchType = $("[name=typeOfSearch]:checked").val();
  var url = $('#url').val();
  var id = url.split('/');
  id= id[id.length-1];
  
  switch(searchType){
    case 'user':getUserID(id); break;
    case 'public':getPublicID(id) ;break;
    default : alert("w");
  }
}

 
  function getPublicID(_id) {
    VK.api("groups.getById",{"group_ids":_id},function(data) {        
      if(data.response)
      {
        var responseId = -(parseInt(data.response['0'].id)); 
        $('#idOfUSer').val(responseId);
      }
      else{
        $('#url').val("wrong Link");
      }
    });
  }
  function getUserID(_id) {
    
    VK.api("users.get",{"user_ids":_id},function(data) {
      if(data.response)
      {
        var responseId = data.response['0'].id; 
        $('#idOfUSer').val(responseId);
      }
      else{
        $('#url').val("wrong Link");
      }
    });
  }


function getSortRules() {
  var t_rules = Array.from($('#tab1 input:checked'));
  var sortRules = new Array();
  
  t_rules.forEach(function(item,i,t_rules) {
    sortRules.push(item.id);
  });
  return sortRules;
}



function sort(_sortRules,_typeOfPost) {
  
  var isSorted = 0;  
  _sortRules.forEach(function(item,i,_sortRules) {
    if(item == _typeOfPost)
    {
      isSorted++;
    }
  });
  if(isSorted > 0)
  {
    return true;
  }
  else
  {
    return false;
  }
}
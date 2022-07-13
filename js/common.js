$(function () {
  $("a[href*=\\#]:not([href=\\#])").click(function () {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var $target = $(this.hash);
      $target =
        ($target.length && $target) || $("[name=" + this.hash.slice(1) + "]");
      if ($target.length) {
        if ($(this).parents(".menuBox").length) {
          setTimeout(function () {
            var targetOffset = $target.offset().top;
            $("html,body").animate({ scrollTop: targetOffset }, 1000);
          }, 100);
        } else {
          var targetOffset = $target.offset().top;
          $("html,body").animate({ scrollTop: targetOffset }, 1000);
        }
        return false;
      }
    }
  });

  $("#gNavi .liStyle").hover(
    function () {
      $(this).find("ul").stop().slideDown();
    },
    function () {
      $(this).find("ul").stop().slideUp();
    }
  );

  $(".menuBox .naviUl > .liStyle > a").click(function () {
    $(this).toggleClass("on");
    $(this).next("ul").stop().slideToggle();
    return false;
  });

  var state = false;
  var scrollpos;

  $(".menu").on("click", function () {
    if (state == false) {
      scrollpos = $(window).scrollTop();
      // $("body").addClass("fixed").css({ top: -scrollpos });
      $(".menuBox").stop().fadeIn("on");
      $(".menu").addClass("active");
      state = true;
    } else {
      // $("body").removeClass("fixed").css({ top: 0 });
      window.scrollTo(0, scrollpos);
      $(".menuBox").stop().fadeOut("on");
      $(".menu").removeClass("active");
      state = false;
    }
    return false;
  });

  $(".menuBox .naviUl .subUl a, .menuBox .naviUl .single_nav_item a").click(function () {
    $("body").removeClass("fixed").css({ top: 0 });
    window.scrollTo(0, scrollpos);
    $(".menuBox").fadeOut("on");
    $(".menu").removeClass("active");
    state = false;
  });

  $(".menuBox").click(function(){
    $(this).fadeOut("on");
    $(".menu").removeClass("active");
    state = false;    
  })
});

$(window).on("load", function () {
  var localLink = window.location + "";
  if (localLink.indexOf("#") != -1 && localLink.slice(-1) != "#") {
    localLink = localLink.slice(localLink.indexOf("#") + 1);
    $("html,body").animate({ scrollTop: $("#" + localLink).offset().top }, 500);
  }
});

$(".btn_open").on("click", function () {
  $(this).next().slideToggle(150);
  $(this).toggleClass("is-open");
  return false;
});

// 常時開くメニュー
$(".all_open_area").on("click", function () {
  $(this).next().slideToggle(150);
  $(this).toggleClass("is-open");
  return false;
});


$("#btn-to-pma").click(function() {
   var scrl_offset = $("#precious-metal-analysis").offset().top - 180;
   if($( window ).width() < 768)
       scrl_offset = $("#precious-metal-analysis").offset().top - 100;
    $([document.documentElement, document.body]).animate({
        scrollTop: scrl_offset
    });
});

$('#btn_sp_drawer').click(function(){
    if($(".floating-sp__drawer").hasClass("js-drawer-open"))
      $(".floating-sp__drawer").removeClass("js-drawer-open");
    else
      $(".floating-sp__drawer").addClass("js-drawer-open");
});

$('#close-floating-wrapper').click(function(){
    var slide_width = $('.floating-pc__lp-area').width() + 30;
    if($(this).hasClass('inactive')){
      $(".floating-pc").animate({ "left": "+="+slide_width+"px" }, "slow");
      $(this).removeClass('inactive');
      $('#close-floating').html('とじる');
    }
    else{
      $(".floating-pc").animate({ "left": "-="+slide_width+"px" }, "slow");
      $(this).addClass('inactive');
      $('#close-floating').html('ひらく');
    }
});

$('#close-contact-pc-wrapper').click(function(){
    var slide_height = $('.floating-pc__contact-area').height() + 30;
    if($(this).hasClass('inactive')){
      $(".floating-pc-contact").animate({ "bottom": "+="+slide_height+"px" }, "slow");
      $(this).removeClass('inactive');
      $('#close-contact-pc').html('とじる');
    }
    else{
      $(".floating-pc-contact").animate({ "bottom": "-="+slide_height+"px" }, "slow");
      $(this).addClass('inactive');
      $('#close-contact-pc').html('ひらく');
    }
});

$(window).on("load",function() {
  function showFloatingMenu() {
    $('.js-fade').show();
    $(".js-fade").fadeTo(500, 1);
  }
  const timeLimit = 5000;
  let timerId = setTimeout(showFloatingMenu, timeLimit);

  $(window).on("scroll", function () {
    if ($(".js-fade").css("opacity") == 0) {
      clearTimeout(timerId);
      timerId = setTimeout(showFloatingMenu, timeLimit);
    }
  });  
});

$('.faq dt').click(function(){
  $(this).parent().toggleClass('active');
  $(this).next().slideToggle();
});
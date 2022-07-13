"use strict";

$(document).on("keyup change", '[name="郵便番号"]', function (e) {
  if (![8, 46].includes(e.keyCode)) {
    let _val = $(this).val().replace(/[^0-9]/g, "");
    if (_val.length > 2) _val = _val.slice(0, 3) + "-" + _val.slice(3, 7);
    $(this).val(_val);
    $.getJSON(
      "https://madefor.github.io/postal-code-api/api/v1/" +
        _val.replace("-", "/") +
        ".json",
      function (json) {
        $('[name="住所"]').val(
          json.data[0].ja.prefecture +
            json.data[0].ja.address1 +
            json.data[0].ja.address2
        );
      }
    );
  }
});

$(function () {
  $("#js-formRadio input").on("click load", function () {
    var value = $(this).attr('value');
    if(value === '出張買取') {
      $('.is-radioTrip').fadeIn();
    } else if (value === '宅配買取') {
      $('.is-radioTrip').fadeOut();
      $('.is-radioDelivery').fadeIn();
    } else if (value === 'お問い合わせ') {
      $('.is-radioTrip, .is-radioDelivery').fadeOut();
    }
  });
});



$(function(){
  //<form>タグのidを指定
  $("#formCheck").validationEngine(
      'attach', {
          promptPosition: "topLeft"//エラーメッセージ位置の指定
      }
  );
});

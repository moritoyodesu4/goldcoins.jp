jQuery(document).ready(function($) {

  $('body').on('click', '.metal_tab li', function(){
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $('.graph_cvs, .sel_scrap').removeClass('active');
    var metal = $(this).data('metal');
    $('.sel_scrap.price_'+metal).addClass('active');
    change_metal_data();
    if($('.no_data_desc').is(":visible"))
      $('#price_trends_month .graph_cvs').removeClass('active');
  });

  // Get Monthly Average Data
  $('body').on('click', '.p_tab', function(){
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    change_metal_data();
    $('.price_trends_container').removeClass('active');
    var period = $(this).data('period');
    $('#price_trends_'+period).addClass('active');
    if($('.no_data_desc').is(":visible"))
      $('#price_trends_month .graph_cvs').removeClass('active');
  });

  $('body').on('click', '#sel_monthly_trends', function(e){
    if($('.p_tab_month').hasClass('active'))
        e.stopPropagation();
  });

  $('body').on('change', '#sel_monthly_trends', function(e){
      show_monthly_table();
  });

  var monthly_chart = {'gold':null, 'pt':null, 'silver': null};
  var daily_chart = {'gold':null, 'pt':null, 'silver': null};
  var yearly_chart = {'gold':null, 'pt':null, 'silver': null};

  var old_data;

  function show_monthly_table(old_data = null){
      var start_year = $('#sel_monthly_trends').val().split('-')[0];
      var end_year = $('#sel_monthly_trends').val().split('-')[1];
      if(old_data == null){
        $.ajax({
          url: "https://manekiya.shop/wp-json/wp/v2/get_monthly_rate",
          type: 'GET',
          data: {'start_year':start_year, 'end_year': end_year},
          success: function(data){
              if(data['gold'].length == 0 && data['pt'].length == 0 && data['silver'].length == 0){
                $('#price_trends_month .no_data_desc').show();
                $('#price_trends_month table tbody .metal_row').remove();
                if(monthly_chart['gold'] != null)
                  monthly_chart['gold'].destroy();
                if(monthly_chart['pt'] != null)
                  monthly_chart['pt'].destroy();
                if(monthly_chart['silver'] != null)
                  monthly_chart['silver'].destroy();
                $('#price_trends_month .graph_cvs').removeClass('active');
                var start_month = start_year+'年'+1+'月';
                var end_month = end_year+'年'+12+'月';
                var period = '期間：'+start_month+'～'+end_month;
                $('#monthly_period').html(period);
              }
              else{
                old_data = data;
                $('#price_trends_month .no_data_desc').hide();
                var cur_metal = $('.metal_tab li.active').data('metal');
                $('#price_trends_month #monthlyChart_'+cur_metal).addClass('active');
                render_monthly_table(data);
                render_monthly_graph(cur_metal);
              }
          }
        });
      }
      else{
          $('#price_trends_month .no_data_desc').hide();
          var cur_metal = $('.metal_tab li.active').data('metal');
          $('#price_trends_month #monthlyChart_'+cur_metal).addClass('active');
          render_monthly_table(old_data);
          render_monthly_graph(cur_metal);
      }

  }

  function render_monthly_table(data)
  {
    $('#price_trends_month table tbody .metal_row').remove();
    var metal = $('.metal_tab li.active').data('metal');
    var number_format = new Intl.NumberFormat('ja-JP');
    var selected_scrap = $('.sel_scrap.active').val();
    var arr_scrap = [];
    arr_scrap['gold'] = ['ingot', 'k24','k23','k22','k21.6','k20','k18','k17','k14','k10','k9','k8','k5','k18wg','k14wg'];
    arr_scrap['pt'] = ['ingot', 'pt1000','pt950','pt900','pt850'];
    arr_scrap['silver'] = ['ingot', 'sv1000ig','sv1000','sv950','sv925','sv900','sv500'];

    for (const key in data){
      var p_year = '1900';
      var arr_peak = {};
      arr_scrap[key].forEach(function (scrap) {
        arr_peak[scrap] = {'max':{'max':0,'min':0}, 'min':{'max':0,'min':0}, 'avg':{'max':0,'min':0}};
      });
      arr_peak['ingot']['max'].max = Math.max.apply(Math, data[key].map(function(o) { return o.max; }));
      arr_peak['ingot']['max'].min = Math.min.apply(Math, data[key].map(function(o) { return o.max; }));
      arr_peak['ingot']['min'].max = Math.max.apply(Math, data[key].map(function(o) { return o.min; }));
      arr_peak['ingot']['min'].min = Math.min.apply(Math, data[key].map(function(o) { return o.min; }));      
      arr_peak['ingot']['avg'].max = Math.max.apply(Math, data[key].map(function(o) { return o.avg; }));
      arr_peak['ingot']['avg'].min = Math.min.apply(Math, data[key].map(function(o) { return o.avg; }));

      arr_scrap[key].forEach(function (scrap) {
        if(scrap != 'ingot'){
          arr_peak[scrap]['max'].max = Math.max.apply(Math, data[key].map(function(o) { return (o[scrap] !== undefined)? o[scrap].max : 0; }, scrap));
          arr_peak[scrap]['max'].min = Math.min.apply(Math, data[key].map(function(o) { return (o[scrap] !== undefined)? o[scrap].max : 10000; }, scrap));
          arr_peak[scrap]['min'].max = Math.max.apply(Math, data[key].map(function(o) { return (o[scrap] !== undefined)? o[scrap].min : 0; }, scrap));
          arr_peak[scrap]['min'].min = Math.min.apply(Math, data[key].map(function(o) { return (o[scrap] !== undefined)? o[scrap].min : 10000; }, scrap));
          arr_peak[scrap]['avg'].max = Math.max.apply(Math, data[key].map(function(o) { return (o[scrap] !== undefined)? o[scrap].avg : 0; }, scrap));
          arr_peak[scrap]['avg'].min = Math.min.apply(Math, data[key].map(function(o) { return (o[scrap] !== undefined)? o[scrap].avg : 10000; }, scrap));
        }
      });

      data[key].forEach(function(element, i){
        arr_scrap[key].forEach(function (scrap, s_index){
          var cls_scrap = scrap.replace('.','_');
          var new_record = '<tr class="price_'+key+' metal_row '+key+'_'+cls_scrap;
          if(metal == key && selected_scrap == cls_scrap)
            new_record += ' active';
          new_record += '">';
          if(p_year != element.year){
            var ym_count = data[key].filter (item => item.year == element.year).length;
            new_record += '<td class="stat_year" rowspan="'+ym_count+'">'+element.year+'</td>';
            if(s_index == arr_scrap[key].length - 1)
              p_year = element.year;
          }
          new_record += '<td>'+element.month+'</td>';
          new_record += '<td';

          if(scrap == 'ingot')
            cur_elem = element;
          else
            cur_elem = element[scrap];

          var cur_max = (cur_elem && cur_elem.max) ? cur_elem.max : 0;
          var cur_min = (cur_elem && cur_elem.min) ? cur_elem.min : 0;
          var cur_avg = (cur_elem && cur_elem.avg) ? cur_elem.avg : 0;

          if(cur_max == arr_peak[scrap]['max'].max && cur_max != 0)
            new_record += ' class="price_max"';
          else if(cur_max == arr_peak[scrap]['max'].min && cur_max != 0)
            new_record += ' class="price_min"';
          new_record += ' data-price="'+cur_max+'">'+number_format.format(cur_max)+'</td>';

          new_record += '<td';
          if(cur_min == arr_peak[scrap]['min'].max && cur_min != 0)
            new_record += ' class="price_max"';
          else if(cur_min == arr_peak[scrap]['min'].min && cur_min != 0)
            new_record += ' class="price_min"';
          new_record += ' data-price="'+cur_min+'">'+number_format.format(cur_min)+'</td>';

          new_record += '<td class="monthly_avg basic_value';
          if(cur_avg == arr_peak[scrap]['avg'].max && cur_avg != 0)
            new_record += ' price_max';
          else if(cur_avg == arr_peak[scrap]['avg'].min && cur_avg != 0)
            new_record += ' price_min';
          new_record += '" data-price="'+cur_avg+'" data-year="'+element.year+'" data-month="'+element.month+'">'+number_format.format(cur_avg)+'</td></tr>';

          $('#price_trends_month table tbody').append(new_record);
        });
      });
    }
  }

  function render_monthly_graph(metal)
  {
    var d_metal_data = [];
    var d_label = [];
    var end_month;
    var start_month;
    var mg_end;
    if($('#price_trends_month table .price_'+metal+'.active').length > 0){
      $('#price_trends_month table .price_'+metal+'.active').each(function(index){
        var elem_avg = $(this).find('.monthly_avg');
        if(index == 0){
          end_month = elem_avg.data('year')+'年'+elem_avg.data('month')+'月';
          mg_end = elem_avg.data('year')+'/'+elem_avg.data('month');
        }
        if(index == $('#price_trends_month table .price_'+metal+'.active').length - 1)
          start_month = elem_avg.data('year')+'年'+elem_avg.data('month')+'月';
        d_metal_data.push(elem_avg.data('price'));
        d_label.push(elem_avg.data('year')+'/'+elem_avg.data('month'));
      });
      var labels = d_label.reverse();
      var period = '期間：'+start_month+'～'+end_month;
      $('#monthly_period').html(period);
      $('.mg_last_label').html(mg_end);
      renderMetalGraphMonth(metal, labels, d_metal_data);
      $('#monthlyChart_'+metal).addClass('active');
    }
    else{
      if(monthly_chart[metal] != null)
        monthly_chart[metal].destroy();
      $('#monthlyChart_'+metal).addClass('active').removeClass('active');
    }
  }

  function render_daily_graph(metal)
  {
    var d_metal_data = [];
    var d_label = [];
    if($('#price_trends_day table .price_'+metal+'.active').length > 0){
      $('#price_trends_day table.rate_table_pc .price_'+metal+'.active').each(function(){
        d_metal_data.push($(this).find('.purchase_tax').data('price'));
        d_label.push($(this).find('.date').html().replace('.', '/'));
      });
      var cur_year = new Date().getFullYear();

      var labels = d_label.reverse();
      var arr_start = labels[0].split('/');
      var arr_end = labels[labels.length-1].split('/');
      if(arr_end[0] >= arr_start[0])
        var period = '期間：'+cur_year+'年'+arr_start[0]+'月'+arr_start[1]+'日～'+cur_year+'年'+arr_end[0]+'月'+arr_end[1]+'日';
      else
        var period = '期間：'+(cur_year-1)+'年'+arr_start[0]+'月'+arr_start[1]+'日～'+cur_year+'年'+arr_end[0]+'月'+arr_end[1]+'日';
      $('#daily_period').html(period);
      $('.dg_last_label').html(arr_end[0]+'/'+arr_end[1]);
      renderMetalGraph(metal, labels, d_metal_data);
      $('#dailyChart_'+metal).addClass('active');
    }
    else
    {
      if(daily_chart[metal] != null)
        daily_chart[metal].destroy();
      $('#dailyChart_'+metal).removeClass('active');
    }
  }

  function render_yearly_graph(metal)
  {
    var d_metal_data = [];
    var d_label = [];
    if($('#price_trends_year table .price_'+metal+'.active').length > 0){
      $('#price_trends_year table .price_'+metal+'.active').each(function(index){
        var elem_avg = $(this).find('.basic_value');
        d_metal_data.push(elem_avg.data('price'));
        d_label.push(elem_avg.data('year'));
      });
      var labels = d_label.reverse();
      renderMetalGraphYear(metal, labels, d_metal_data);
      $('#yearlyChart_'+metal).addClass('active');
    }
    else{
      if(yearly_chart[metal] != null)
        yearly_chart[metal].destroy();
      $('#yearlyChart_'+metal).addClass('active').removeClass('active');
    }
  }  

  function renderMetalGraph(metal, labels, data){
    switch(metal){
      case 'gold': 
            m_label = '貴金属相場価格ー金';
            b_color = 'rgb(216, 175, 37)';
            break;
      case 'pt': 
            m_label = '貴金属相場価格ープラチナ';
            b_color = '#a4a5d3';
            break;
      case 'silver': 
            m_label = '貴金属相場価格ー銀';
            b_color = '#999999';
            break;
      default:
            m_label = '';
            b_color = 'rgb(75, 192, 192)';
            break;
    }
    if(daily_chart[metal] != null)
      daily_chart[metal].destroy();
    var ctx = $('#dailyChart_'+metal);
    daily_chart[metal] = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: m_label,
              data: data.reverse(),
              borderWidth: 1,
              borderColor: b_color,
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: false,
                  ticks: {
                      callback: function(val, index) {
                              return val;
                      },
                      font:  function(context) {
                        var width = context.chart.width;
                        var size = Math.round(width / 30);
                        if($(window).width() > 1040)
                          size = 12;
                         return {
                          size: size,
                          family: '-webkit-pictograph'
                        };
                      }
                  }
              },
              x: {
                  ticks: {
                      callback: function(tick, index, array) {
                          return (index % 2) ? "" : labels[index];
                      },
                      maxRotation: 0,
                      minRotation: 0,
                      font:  function(context) {
                        var width = context.chart.width;
                        var size = Math.round(width / 30);
                        if($(window).width() > 1040)
                          size = 12;
                         return {
                          size: size,
                          family: '-webkit-pictograph'
                        };
                      }
                  }
              }
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  labels: {
                      // This more specific font property overrides the global property
                    font: function(context) {
                      var width = context.chart.width;
                      var size = Math.round(width / 25);
                      if($(window).width() > 1040)
                        size = 12;
                       return {
                        size: size
                      };
                    },
                  }
              }
          }
      }
    });
  }

  function renderMetalGraphMonth(metal, labels, data){
    switch(metal){
      case 'gold': 
            m_label = '貴金属相場価格ー金';
            b_color = 'rgb(216, 175, 37)';
            break;
      case 'pt': 
            m_label = '貴金属相場価格ープラチナ';
            b_color = '#a4a5d3';
            break;
      case 'silver': 
            m_label = '貴金属相場価格ー銀';
            b_color = '#999999';
            break;
      default:
            m_label = '';
            b_color = 'rgb(75, 192, 192)';
            break;
    }
    if(monthly_chart[metal] != null)
      monthly_chart[metal].destroy();
    var ctx = $('#monthlyChart_'+metal);
    monthly_chart[metal] = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: m_label,
              data: data.reverse(),
              borderWidth: 1,
              borderColor: b_color,
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: false,
                  ticks: {
                      callback: function(val, index) {
                              return val;
                      },
                      font:  function(context) {
                        var width = context.chart.width;
                        var size = Math.round(width / 30);
                        if($(window).width() > 1040)
                          size = 12;
                         return {
                          size: size,
                          family: '-webkit-pictograph'
                        };
                      }
                  }
              },
              x: {
                  ticks: {
                      callback: function(tick, index, array) {
                          return (index % 2) ? "" : labels[index];
                      },
                      font:  function(context) {
                        var width = context.chart.width;
                        var size = Math.round(width / 30);
                        if($(window).width() > 1040)
                          size = 12;
                         return {
                          size: size,
                          family: '-webkit-pictograph'
                        };
                      },
                      maxRotation: 0,
                      minRotation: 0
                  }
              }
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  labels: {
                      // This more specific font property overrides the global property
                    font: function(context) {
                      var width = context.chart.width;
                      var size = Math.round(width / 25);
                      if($(window).width() > 1040)
                        size = 12;
                       return {
                        size: size
                      };
                    },
                  }
              }
          }
      }
    });
  }

  function renderMetalGraphYear(metal, labels, data){
    switch(metal){
      case 'gold': 
            m_label = '貴金属相場価格ー金';
            b_color = 'rgb(216, 175, 37)';
            break;
      case 'pt': 
            m_label = '貴金属相場価格ープラチナ';
            b_color = '#a4a5d3';
            break;
      case 'silver': 
            m_label = '貴金属相場価格ー銀';
            b_color = '#999999';
            break;
      default:
            m_label = '';
            b_color = 'rgb(75, 192, 192)';
            break;
    }
    if(yearly_chart[metal] != null)
      yearly_chart[metal].destroy();
    var ctx = $('#yearlyChart_'+metal);
    yearly_chart[metal] = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: m_label,
              data: data.reverse(),
              borderWidth: 1,
              borderColor: b_color,
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: false,
                  ticks: {
                      callback: function(val, index) {
                              return val;
                      },
                      font:  function(context) {
                        var width = context.chart.width;
                        var size = Math.round(width / 30);
                        if($(window).width() > 1040)
                          size = 12;
                         return {
                          size: size,
                          family: '-webkit-pictograph'
                        };
                      }
                  }
              },
              x: {
                  ticks: {
                      callback: function(tick, index, array) {
                          return labels[tick];
                      },
                      maxRotation: 0,
                      minRotation: 0,
                      font:  function(context) {
                        var width = context.chart.width;
                        var size = Math.round(width / 30);
                        if($(window).width() > 1040)
                          size = 12;
                         return {
                          size: size,
                          family: '-webkit-pictograph'
                        };
                      }
                  }
              }
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  labels: {
                      // This more specific font property overrides the global property
                    font: function(context) {
                      var width = context.chart.width;
                      var size = Math.round(width / 25);
                      if($(window).width() > 1040)
                        size = 12;
                       return {
                        size: size
                      };
                    },
                  }
              }
          }
      }
    });
  }  

  function mark_peak_value(table, metal, price_elem){
    var arr_price = [];
    $(table+' .metal_row.active '+price_elem).removeClass('max_price');
    $(table+' .metal_row.active '+price_elem).removeClass('min_price');
    $(table+' .metal_row.active '+price_elem).each(function(){
      arr_price.push($(this).data('price'));
    });
    var max = Math.max.apply(Math, array);
    var min = Math.min.apply(Math, array);
    $(table+' .metal_row.active '+price_elem).each(function(){
      if($(this).val('price') == max)
        $(this).addClass('max_price');
      if($(this).val('price') == min)
        $(this).addClass('min_price');
    });
  }

  $('.sel_scrap').change(function(){
    change_metal_data();
  });

  function change_metal_data(){
    var metal = $('.metal_tab li.active').data('metal');
    var scrap = $('.sel_scrap.active').val();
    $('.metal_row').removeClass('active');
    var is_data_empty = true;
    $('.price_'+metal+'.'+metal+'_'+scrap).each(function(){
      if($(this).find('.basic_value').data('price') != 0){
        is_data_empty = false;
        return false;
      }
    });
    if(!is_data_empty){
      $('.no_data_desc').hide();
      $('.price_'+metal+'.'+metal+'_'+scrap).addClass('active');
    }
    else
      $('.no_data_desc').show();
    render_daily_graph(metal);
    render_monthly_graph(metal);
    render_yearly_graph(metal);    
    stylize_daily_table();
  }

  function stylize_daily_table() {
    $('.price_trends_container table tr.active').each(function(index){
      if(index % 2 == 1)
        $(this).addClass('even_row');
      else
        $(this).addClass('odd_row');
    });
    $('.rate_table_sp .metal_row.active.row_collapse').addClass('row_hidden');
    $('.day_readmore_wrapper').show();
  }

  var elem_graph;

  $(document).ready(function(){
    if($('body').hasClass('home')){
      if($(window).width() > 1039){
        $('.top__intro .side_graph').remove()
      }
      else
        $('.sidebar .side_graph').remove()
    }
    elem_graph = $('.side_graph').clone();
    show_monthly_table();
    render_daily_graph('gold');
    stylize_daily_table();

    var old_ppc = getUrlParameter('ppc');
    if(old_ppc)
      $('.sel_icount').val(old_ppc);
    var pnum = getUrlParameter('page');
    $('.category_pnav .wp-pagenavi a').each(function(){
      $(this).attr('href', $(this).attr('href')+'#ttl_kaitori_achieve');
    });
  });

  $('#day_readmore').click(function(){
    $( ".rate_table_sp .metal_row.active").removeClass('row_hidden');
    $(this).parent().hide();
  });


  $(window).resize(function(){
    if($('body').hasClass('home')){
      $('.side_graph').remove();
      if($(window).width() > 1039){
        elem_graph.insertAfter($( ".sidebar .common-market" ));
      }
      else{
        elem_graph.insertAfter($( ".top__intro .common-market" ));
      }
      show_monthly_table(old_data);
      render_daily_graph('gold');
    }
  });

  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
  };

  $('.sel_icount').change(function(){
    var ttl_id = "#ttl_kaitori_achieve";
    var old_ppc = getUrlParameter('ppc');
    var url = window.location.href;
    var new_ppc = $(this).val();
    var new_url;
    if(old_ppc)
      new_url = url.replace('ppc='+old_ppc, 'ppc='+new_ppc);
    else{
      if (url.indexOf(ttl_id) >= 0)
        new_url = url.replace(ttl_id, '?ppc='+new_ppc+ttl_id);
      else
        new_url = url+"?ppc="+new_ppc;
    }
    window.location.href = new_url;
  });

});
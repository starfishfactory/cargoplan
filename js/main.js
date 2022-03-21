(function ($) {
    "use strict";

    /*--------------------------
    preloader
    ---------------------------- */
    $(window).on('load', function () {
        var pre_loader = $('#preloader');
        pre_loader.fadeOut('slow', function () {
            $(this).remove();
            daumMapInit();
        });
    });

    /*---------------------
     TOP Menu Stick
    --------------------- */
    var s = $("#sticker");
    var pos = s.position();
    $(window).on('scroll', function () {
        var windowpos = $(window).scrollTop() > 300;
        if (windowpos > pos.top) {
            s.addClass("stick");
        } else {
            s.removeClass("stick");
        }
    });

    /*----------------------------
     Navbar nav
    ------------------------------ */
    var main_menu = $(".main-menu ul.navbar-nav li ");
    main_menu.on('click', function () {
        main_menu.removeClass("active");
        $(this).addClass("active");
    });

    /*----------------------------
     wow js active
    ------------------------------ */
    new WOW().init();

    $(".navbar-collapse a:not(.dropdown-toggle)").on('click', function () {
        $(".navbar-collapse.collapse").removeClass('in');
    });

    //---------------------------------------------
    //Nivo slider
    //---------------------------------------------
    $('#ensign-nivoslider').nivoSlider({
        effect: 'random',
        slices: 15,
        boxCols: 12,
        boxRows: 8,
        animSpeed: 500,
        pauseTime: 5000,
        startSlide: 0,
        directionNav: true,
        controlNavThumbs: false,
        pauseOnHover: true,
        manualAdvance: false,
    });

    /*----------------------------
     Scrollspy js
    ------------------------------ */
    var Body = $('body');
    Body.scrollspy({
        target: '.navbar-collapse',
        offset: 80
    });

    /*---------------------
      Venobox
    --------------------- */
    var veno_box = $('.venobox');
    veno_box.venobox();

    /*----------------------------
    Page Scroll
    ------------------------------ */
    var page_scroll = $('a.page-scroll');
    page_scroll.on('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 55
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    /*--------------------------
      Back to top button
    ---------------------------- */
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });

    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    /*----------------------------
     Parallax
    ------------------------------ */
    var well_lax = $('.wellcome-area');
    well_lax.parallax("50%", 0.4);
    var well_text = $('.wellcome-text');
    well_text.parallax("50%", 0.6);

    /*--------------------------
     collapse
    ---------------------------- */
    var panel_test = $('.panel-heading a');
    panel_test.on('click', function () {
        panel_test.removeClass('active');
        $(this).addClass('active');
    });

    /*---------------------
     Testimonial carousel
    ---------------------*/
    var test_carousel = $('.testimonial-carousel');
    test_carousel.owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        autoplay: true,
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    });
    /*----------------------------
     isotope active
    ------------------------------ */
    // portfolio start
    $(window).on("load", function () {
        var $container = $('.awesome-project-content');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        var pro_menu = $('.project-menu li a');
        pro_menu.on("click", function () {
            var pro_menu_active = $('.project-menu li a.active');
            pro_menu_active.removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false
                }
            });
            return false;
        });

    });
    //portfolio end

    /*---------------------
     Circular Bars - Knob
  --------------------- */
    if (typeof($.fn.knob) != 'undefined') {
        var knob_tex = $('.knob');
        knob_tex.each(function () {
            var $this = $(this),
                knobVal = $this.attr('data-rel');

            $this.knob({
                'draw': function () {
                    $(this.i).val(this.cv + '%')
                }
            });

            $this.appear(function () {
                $({
                    value: 0
                }).animate({
                    value: knobVal
                }, {
                    duration: 2000,
                    easing: 'swing',
                    step: function () {
                        $this.val(Math.ceil(this.value)).trigger('change');
                    }
                });
            }, {
                accX: 0,
                accY: -150
            });
        });
    }

})(jQuery);

<!-- 3. 실행 스크립트 -->
function daumMapInit() {
    $('#daumRoughmapContainer1647828095243').empty();
    var mapWidth = $('#daumRoughmapContainer1647828095243').parents('div').width();
    new daum.roughmap.Lander({
        "timestamp": "1647828095243",
        "key": "29its",
        "mapWidth": mapWidth,
        "mapHeight": "355"
    }).render();
}

$(window).resize(function () {
    daumMapInit();
});

$('#sus_submit').on('click', function () {
    $('form[name="mailForm"] input[name="email"]').val($('#sus_email').val()).focus();
});

$('form[name="mailForm"]').on('submit', function (e) {
    e.preventDefault();
    var $form = $(this);
    var $a = $('<a>111111111</a>').attr({
        href: 'mailto:' + $form.find('input[name="email"]').val() +
            '?subject=' + $form.find('input[name="subject"]').val() +
            '&body=' + $form.find('textarea[name="message"]').val(),
    });
    $('body').append($a);
    $a.trigger('click');
});
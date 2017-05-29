$(document).ready(function () {

    var subtitleEl = $('#subtitle');
    var timerEl = $('#timer');
    var seekerEl = $('#seeker');
    var ejectEl = $('#eject');
    var refreshEl = $('#refresh');
    var searchEl = $('#search');
    var backwardEl = $('#backward');
    var forwardEl = $('#forward');
    var playEl = $('#play');
    var filesEl = $('#files');
    var hideEl = $(".hide");
    var showEl = $(".show");
    var closeEl = $('#close');
    var minimizeEl = $('#minimize');
    var lightsEl = $('#lights');
    var searchResultEl = $('#results');
    var searchMovieEl = $('#searchMovie');
    var searchButtonEl = $('#searchButton');
    var containerEl = $('#container');
    var controlsEl = $('#controls');
    var draggersEl = $('#dragger');
    var spinnerEl = $('#spinner');
    var fontsizerEl = $('#fontSizer');
    var prevEl = $('#prev');
    var nextEl = $('#next');
    var infoEl = $('#info');
    var donateEl = $('#donate');

    var service = analytics.getService('subber_app');
    var tracker = service.getTracker('UA-58454579-1');
    tracker.sendAppView('pageview');
    tracker.sendEvent('Homepage');

    function reset() {

        stop();

        window.currentTime = 0;
        window.interval = 50;
        window.timer = 0;
        window.subtitlesLoaded = [];
        window.subtitles = [];
        window.fileName = '';
        window.visible = 0;
        window.fontSize = 20;
    }


    function stop() {
        clearTimeout(window.timer);
    }

    reset();

    $('a[href="#"]').click(function (e) {
        e.preventDefault();
    });


    function toSeconds(t) {

        if (t) {
            t = t.replace(',', ':');
            var p = t.split(':');
            var s = parseInt(parseInt(p[0]) * 1000 * 60 * 60);
            s = s + parseInt(parseInt(p[1]) * 1000 * 60);
            s = s + parseInt(parseInt(p[2]) * 1000);
            s = s + parseInt(p[3]);
        }
        return s;
    }


    function strip(s) {

        return s.replace(/^\s+|\s+$/g, "");
    }

    function millisToMins(millis) {

        var seconds = parseInt((millis / 1000) % 60)
            , minutes = parseInt((millis / (1000 * 60)) % 60)
            , hours = parseInt((millis / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }


    function printSubtitle(text, duration, fade, key) {

        subtitleEl.append("<div class='key_" + key + "'>" + text + "</div>").fadeIn(fade);

        window.setTimeout(function () {
            $('.key_' + key).fadeOut(fade).remove();
        }, duration);
    }

    function showInfo(text, start, duration) {
        if(duration) {
            setTimeout(function () {
                infoEl.html(text).show();
                setTimeout(function () {
                    infoEl.html('').hide();
                }, duration);
            }, start);
        } else {
            infoEl.html(text).show();
        }
    }

    function play() {

        window.subtitles = window.subtitlesLoaded;
        seek(currentTime);

        var start = new Date().getTime(),
            time = 0;

        function instance() {
            time += interval;

            var diff = (new Date().getTime() - start) - time;
            window.timer = window.setTimeout(instance, (interval - diff));

            timerEl.val(millisToMins(currentTime));

            window.currentTime = window.currentTime + interval;
            seekerEl.slider("value", window.currentTime);

            for (var key in window.subtitles) {
                if (window.subtitles.hasOwnProperty(key)) {
                    if (currentTime >= key) {
                        if (window.subtitles[key][2] == 0) {
                            printSubtitle(window.subtitles[key][1], window.subtitles[key][0], 0, key);
                            window.subtitles[key][2] = 1;
                            break;
                        }
                    }
                }
            }
        }

        window.timer = window.setTimeout(instance, interval);
    }


    function convertSubtitles(data) {

        var srt = data.replace(/\r\n|\r|\n/g, '\n');
        var subtitlesTemp = [];
        srt = strip(srt);
        var srt_ = srt.split('\n\n');

        var ii = 0;
        for (var s in srt_) {
            var st = srt_[s].split('\n');
            if (st.length >= 2) {
                var n = st[0];
                var i = strip(st[1].split(' --> ')[0]);
                var o = strip(st[1].split(' --> ')[1]);
                var t = st[2];
                if (st.length > 2) {
                    for (var j = 3; j < st.length; j++)
                        t += '\n' + st[j];
                }
                var is = toSeconds(i);
                var os = toSeconds(o) - is;

                subtitlesTemp[is] = [os, t, 0];
                ii++;
            }
        }
        window.subtitlesLoaded = subtitlesTemp;
        window.subtitleLength = is;
        timerEl.val(millisToMins(currentTime));
        hideEl.show();
        showEl.hide();
        lightsEl.show();
        containerEl.addClass('padding');

        printSubtitle('Loaded: ' + window.fileName, 4000, 300);

        seekerEl.slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: is,
            value: 0,
            slide: function (event, ui) {
                var val = ui.value;
                timerEl.val(millisToMins(val));
                seek(val);
            }
        });

        seekerEl.slider().mousemove(function (e) {
            var width = $(this).width();
            var offset = $(this).offset();
            var options = $(this).slider('option');
            var value = Math.round(((e.clientX - offset.left) / width) *
                    (options.max - options.min)) + options.min;
            showInfo('Seek to: ' + millisToMins(value), 0, null);
        }).mouseout(function() {
            showInfo('', 0, null);
        });

        subtitleEl.css("font-size", window.fontSize);

        fontsizerEl.slider({
            orientation: "vertical",
            range: "min",
            min: 16,
            max: 48,
            value: window.fontSize,
            slide: function (event, ui) {
                window.fontSize = ui.value;
                subtitleEl.text('Sample Text, Sample Text').show().css("font-size", ui.value + "px");
            }
        });

        fontsizerEl.on('mouseout',function() {
            subtitleEl.hide().text('');
        });

        clearTimeout(window.timer);
        play();
        playEl.addClass('active').find('i').removeClass('fa-play').addClass('fa-pause');
    }

    function seek(t) {
        window.currentTime = t;
        window.subtitles = window.subtitlesLoaded;

        for (var key in window.subtitles) {
            if (window.subtitles.hasOwnProperty(key)) {
                window.subtitles[key][2] = 0;
                if (currentTime >= key) {
                    window.subtitles[key][2] = 1;
                }
            }
        }
    }

    function displaySearchResult(result) {
        var data = result[0].data;

        window.languages = [];
        window.years = [];

        $('#movie-language, #movie-year').show();

        for (var i = 0; i < data.length; i++) {
            if (window.languages.indexOf(data[i].LanguageName) == -1) {
                window.languages.push(data[i].LanguageName);
            }

            if (window.years.indexOf(data[i].MovieYear) == -1) {
                window.years.push(data[i].MovieYear);
            }
        }

        window.languages.sort();
        window.years.sort();

        for (var i = 0; i < window.languages.length; i++) {
            $('#movie-language').append('<option value="' + window.languages[i] + '">' + window.languages[i] + '</option>')
        }
        for (var i = 0; i < window.years.length; i++) {
            $('#movie-year').append('<option value="' + window.years[i] + '">' + window.years[i] + '</option>')
        }

        if (data.length == 0) {
            var html = "<ul><li>Couldn't find any results</li></ul>";
        } else {
            html = '<ul>';

            for (var i = 0; i < data.length; i++) {
                html += '<li><a href="#" data-link="' + data[i].SubDownloadLink +
                    '" data-language="' + data[i].LanguageName +
                    '" data-year="' + data[i].MovieYear +
                    '" data-file-name="' + data[i].SubFileName +
                    '" class="movie" id="' + data[i].IDSubtitle +'">' +
                    data[i].MovieName;

                if (data[i].MovieYear) {
                    html += ' - <span class="small">' + data[i].MovieYear + '</span>';
                }
                if (data[i].SubLastTS) {
                    html += ' - <span class="small">' + data[i].SubLastTS + '</span>';
                }
                html += ' <span class="lang">(' + data[i].LanguageName + ')</span>' ;
                html += '</a></li>';
            }
        }

        searchResultEl.html(html);

        $('#movie-language, #movie-year').change(function(){
            var lang = $('#movie-language').val();
            var year = $('#movie-year').val();

            $('.movie').hide();

            if (lang == 'All Languages' && year == 'All Years')
                $('.movie').show();
            else if (lang == 'All Languages')
                $('.movie[data-year="' + year + '"]').show();
            else if (year == 'All Years')
                $('.movie[data-language="' + lang + '"]').show();

            else if (lang != 'All Languages' && year != 'All Years')
                $('.movie[data-year="' + year + '"][data-language="' + lang + '"]').show();
        });

        $('.movie').hover(function () {
            showInfo('Load: ' + $(this).attr('data-file-name'), 0, null);
        }, function () {
            showInfo('', 0, null);
        });

        $('.movie').click(function () {
            spinnerEl.hide();
            window.fileName = $(this).attr('data-file-name');
            var link = $(this).attr('data-link');
            link = link.replace('.gz','');
            link = link.replace('file/src-api','subencoding-utf8/filead/src-api');

            $.get(link, function(response) {
                convertSubtitles(response);
                window.srt = response;
                window.foundSrt = 1;
                searchResultEl.hide();
                searchMovieEl.hide();
                tracker.sendEvent('Movie: ' + $('.movie').text());
            });
        });
    }

    function search() {
        if (searchMovieEl.val() != '' && searchMovieEl.val().length > 2) {
            searchEl.removeClass('active');
            spinnerEl.show();
            donateEl.hide();
            searchResultEl.addClass('hide');
            $.xmlrpc({
                url: 'http://api.opensubtitles.org/xml-rpc',
                methodName: 'LogIn',
                params: ['subber', 'albatros', 'en', 'subberjp'],
                success: function (response, status, jqXHR) {

                    var token = response[0].token;

                    $.xmlrpc({
                        url: 'http://api.opensubtitles.org/xml-rpc',
                        methodName: 'SearchSubtitles',
                        params: [token, [{query: searchMovieEl.val()}], {limit: 500}],
                        success: function (response, status, jqXHR) {
                            tracker.sendEvent('Search: ' + searchMovieEl.val());

                            displaySearchResult(response);
                            window.searchResults = response;
                            spinnerEl.hide();
                            searchResultEl.removeClass('hide');
                        },
                        error: function (jqXHR, status, error) {
                            searchResultEl.removeClass('hide').html('<ul><li>' + error + '</li></ul>');
                        }
                    });
                },
                error: function (jqXHR, status, error) {
                    searchResultEl.removeClass('hide').html('<ul><li>' + error + '</li></ul>');
                }
            });
        } else {
            searchResultEl.removeClass('hide').html('<ul><li>Movie name should be at least 3 chars</li></ul>');
        }
    }

    searchButtonEl.on('click', function () {
        search();
    });

    searchMovieEl.on('keypress', function(event) {
        if (event.which == 13) {
            event.preventDefault();
            search();
        }
    });

    backwardEl.click(function () {
        currentTime = currentTime - 1000;
        seek(currentTime);
        timerEl.val(millisToMins(currentTime));
    });

    forwardEl.click(function () {
        currentTime = currentTime + 1000;
        seek(currentTime);
        timerEl.val(millisToMins(currentTime));
    });

    playEl.click(function () {
        clearTimeout(window.timer);
        timerEl.val(millisToMins(currentTime));

        if (playEl.hasClass('active')) {
            playEl.removeClass('active').find('i').removeClass('fa-pause').addClass('fa-play');
            window.setTimeout(function () {
                subtitleEl.fadeIn(80);
            }, 3000);
        } else {
            play();
            playEl.addClass('active').find('i').removeClass('fa-play').addClass('fa-pause');
        }
    });

    refreshEl.click(function () {
        stop();

        searchEl.removeClass('active');

        subtitleEl.hide();
        hideEl.hide();
        showEl.show();
        searchResultEl.show();
        lightsEl.hide();
        containerEl.removeClass('padding');
    });

    searchEl.click(function () {
        stop();

        if (searchEl.hasClass('active')) {
            searchEl.removeClass('active');
            searchMovieEl.fadeOut();
            searchResultEl.fadeOut();

        } else {
            searchEl.addClass('active');
            searchMovieEl.fadeIn();
            searchMovieEl.focus();
            searchResultEl.fadeIn();
        }
    });

    ejectEl.click(function () {
        $('#files').val('');
        filesEl.click();
        searchMovieEl.hide()
    });

    lightsEl.click(function () {
        if (lightsEl.hasClass('active')) {
            hideEl.show();
            draggersEl.show();
            lightsEl.removeClass('active');
            containerEl.addClass('border').removeClass('drag');
            minimizeEl.add(closeEl).show();
        } else {
            hideEl.hide();
            draggersEl.hide();
            lightsEl.addClass('active');
            containerEl.removeClass('border').addClass('drag');
            minimizeEl.add(closeEl).hide();
        }
    });

    closeEl.click(function () {
        window.close();
    });

    minimizeEl.click(function () {
        chrome.app.window.current().minimize();
    });

    playEl.hover(function () {
        if (playEl.hasClass('active')) {
            showInfo('Pause', 0, null);
        } else {
            showInfo('Play', 0, null);
        }
    }, function () {
        showInfo('', 0, null);
    });

    fontsizerEl.hover(function () {
        showInfo('Change font size', 0, null);
    }, function () {
        showInfo('', 0, null);
    });

    backwardEl.hover(function () {
        showInfo('Seek 1 second before', 0, null);
    }, function () {
        showInfo('', 0, null);
    });

    forwardEl.hover(function () {
        showInfo('Seek 1 second after', 0, null);
    }, function () {
        showInfo('', 0, null);
    });

    searchMovieEl.add(searchButtonEl).hover(function () {
        showInfo('Search for subtitles online', 0, null);
    }, function () {
        showInfo('', 0, null);
    });

    refreshEl.hover(function () {
        showInfo('Go back to search results', 0, null);
    }, function () {
        showInfo('', 0, null);
    });

    minimizeEl.hover(function () {
        showInfo('Minimize the window', 0, null);
    }, function () {
        showInfo('', 0, null);
    });

    closeEl.hover(function () {
        showInfo('Exit the program', 0, null);
    }, function () {
        showInfo('', 0, null);
    });

    lightsEl.hover(function () {
        if (lightsEl.hasClass('active')) {
            showInfo('Turn the lights on', 0, null);
        } else {
            showInfo('Turn the lights off', 0, null);
        }
        }, function () {
        showInfo('', 0, null);
    });

    if (navigator.userAgent.indexOf('Mac OS X') != -1) {
        $("body").addClass("mac");
    } else {
        $("body").addClass("pc");
    }
});

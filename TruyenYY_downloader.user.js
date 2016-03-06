// ==UserScript==
// @name         TruyenYY downloader
// @namespace    http://devs.forumvi.com/
// @version      1.1.0
// @description  Tải truyện từ truyenyy.com định dạng html. Sau đó, bạn có thể dùng Mobipocket Creator để tạo ebook prc
// @author       Zzbaivong
// @icon         http://truyenyy.com/static/img/truyenyy-logo.png
// @match        http://truyenyy.com/truyen/*
// @require      http://code.jquery.com/jquery-2.2.1.min.js
// @require      http://openuserjs.org/src/libs/baivong/FileSaver.min.js
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function ($, window, document, undefined) {

    'use strict';

    window.URL = window.URL || window.webkitURL;

    function downloadFail(url) {

        console.log('%c' + url, 'color:red;');
        $download.html('<i class="icon-repeat icon-white"></i> Resume...').css('background', 'red');
        disableClick = false;

        setTimeout(function() {
            $download.trigger('click');
        }, 120000);

    }

    function getChapter() {

        var path = location.pathname,
            url = path.replace('/truyen/', '/doc-truyen/') + 'chuong-' + count,
            fileName = path.slice(1, -1) + '_' + begin + '-' + end + '.html',
            blob;

        if (count > max) {

            txt = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body><h1><font color="red">' + $('h1').text() + '</font></h1><h3><font color="blue">' + $('.lww p:eq(0)').text() + '</font></h3><h3><font color="green">' + $('.lww p:eq(1)').text() + '</font></h3><h3>Chương từ ' + begin + ' đến ' + end + '</h3><br><br><br><br><br>' + txt + '<p><br><br><br><br><br>-- Hết --</p><br><br><br><br><br><p>Truyện được tải từ: TruyenYY - http://truyenyy.com</p><p>Userscript được viết bởi: Zzbaivong - http://devs.forumvi.com</p></body></html>';

            blob = new Blob([txt], {
                type: 'text/html'
            });

            saveAs(blob, fileName);

            $download.attr({
                href: window.URL.createObjectURL(blob),
                download: fileName
            }).html('<i class="icon-ok icon-white"></i> Download Finished!').css('background', 'green').off('click');

            $(window).off("beforeunload");

            console.log('%cDownload Finished!', 'color:blue;');

        } else {

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function (response) {

                    var $data = $(response.response),
                        title = $data.find('h1').text(),
                        $chapter = $data.find('#id_noidung_chuong');

                    if ($chapter.length && title !== 'Chương thứ yyy: Ra đảo') {

                        console.log('%c' + url, 'color:green;');
                        $download.html('<i class="icon-refresh icon-white"></i> ' + count + '/' + max).css('background', 'orange');

                        $chapter.find('span').remove();
                        txt += '<h2 class="title">' + title + '</h2>' + $chapter.html();

                        ++count;
                        getChapter();

                    } else {
                        downloadFail(url);
                    }

                },
                onerror: function (err) {
                    downloadFail(url);
                    console.error(err);
                }
            });

        }

    }


    var $download = $('[href="#dschuong"]'),
        count = 1,
        max = parseInt($('.ip5').first().find('a').attr('href').match(/\/chuong-(\d+)\/$/)[1], 10),
        begin,
        end,
        txt = '',
        enablePrompt = true,
        disableClick = false;

    $download.html('<i class="icon-download icon-white"></i> Download').css('background', 'orange').on('click', function (e) {
        e.preventDefault();

        if (disableClick) {
            return;
        }

        if (enablePrompt) {

            begin = prompt("Chọn Chương bắt đầu tải", count);
            end = prompt("Chọn Chương kết thúc tải", max);

            if (begin !== null && /^\d+$/.test(begin)) {
                begin = parseInt(begin, 10);
                if (begin < max) {
                    count = begin;
                }
            } else {
                begin = count;
            }

            if (end !== null && /^\d+$/.test(end)) {
                end = parseInt(end, 10);
                if (end > count) {
                    max = end;
                }
            } else {
                end = max;
            }

            $(window).on("beforeunload", function () {
                return "Truyện đang được tải xuống...";
            });

            enablePrompt = false;
        }

        getChapter();

        disableClick = true;
    });

})(jQuery, window, document);
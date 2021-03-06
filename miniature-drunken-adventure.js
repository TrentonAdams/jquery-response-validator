function jqvlog()
{
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function ()
    {
    };

    console.log.apply(console, arguments);
}

(function ($)
{
    $(document).ready(function ()
    {
        $.fn.w3cValidate = function (options)
        {  // BEGIN w3cValidate plugin
            // this is still docs
            var settings = $.extend({
                /**
                 * Url to the w3c validator.  It must be on the same domain,
                 * or the browser will not be able to receive any data
                 * back from it except headers.  Defaults to
                 * /w3c-validator/check, where it expects you have installed
                 * or setup mod-proxy to point to, an installation of w3c
                 * validator.
                 */
                url: '/w3c-validator/check',
                /**
                 * The two doctype settings are the same as those
                 * contained on the "direct input" tab of the validator. View
                 * the source of the html to grab the one you need.
                 *
                 * default: doctype: 'XHTML 1.0 Transitional'
                 *          prefill_doctype: 'xhtml10'
                 */
                doctype: 'XHTML 1.0 Transitional',
                doctype_prefill_doctypeshort: 'xhtml10',
                /**
                 * The div where you would like results output to.  They will
                 * be output to another div which is hidden by default, and
                 * a simple message will be displayed to indicate validation
                 * failure.  This message will be clickable, to show more
                 * information.
                 *
                 * default: #validated
                 */
                divSelector: '#validated',
                /**
                 * The validator wraps your html snippet with the proper html
                 * wrapper, based on the doctype you passed in.  This
                 * value is the compensator for that wrap, so that we can tell
                 * you what line of your snippet failed validation. For xhtml10,
                 * that results in 12 lines preceding your snippet.
                 */
                lineOffset: 12
            }, options);

            $(document).ajaxSuccess(function (event, xmlHttpRequest,
                    ajaxOptions)
            {   // BEGIN ajaxSuccess hook
                jqvlog('w3cValidation: %o', ajaxOptions.w3cValidation);
                if ((ajaxOptions.w3cValidation === undefined ||
                        !ajaxOptions.auW3CValidation) &&
                        ajaxOptions.dataType == 'html')
                {
                    var data = {fragment: xmlHttpRequest.responseText,
                        output: 'json', doctype: settings.doctype,
                        prefill_doctype: settings.prefill_doctype, prefill: '1',
                        group: '0'};
                    jqvlog('data: %o', data);
                    $.ajax({
                        url: settings.url,
                        data: data,
                        dataType: 'json',
                        type: 'POST',
                        w3cValidation: true, /* custom option*/
                        success: function (page, status, jqXHR)
                        {
                            jqvlog('w3c response: %o', page);
                            jqvlog('w3c response: %s', jqXHR.responseText);

                            $(settings.divSelector).html('');
                            var lines = xmlHttpRequest.responseText.split('\n');
                            var newText = '';
                            var line = 1;
                            $.each(lines, function ()
                            {
                                newText = newText + line +
                                        ' : <span style="background-color: #ccc">' +
                                        $('<div/>').text(this).html() +
                                        '</span>\n';
                                line++;
                            });
                            $(settings.divSelector).append('<div><pre>' +
                                    newText + '</pre></div>');
                            for (var index in page.messages)
                            {
                                jqvlog('explanation: %o',
                                        page.messages[index].explanation);
                                jqvlog('message: %o',
                                        page.messages[index].message);
                                jqvlog('line: %d',
                                        page.messages[index].lastLine -
                                                settings.lineOffset);
                                $(settings.divSelector).append('<p>' +
                                        '<strong>line: ' +
                                        (page.messages[index].lastLine -
                                                settings.lineOffset) +
                                        ',col: ' +
                                        page.messages[index].lastColumn +
                                        '</strong> ' +
                                        page.messages[index].message +
                                        '</p>');
                            }
                        },
                        error: function (jqXHR, textStatus, thrownError)
                        {
                            jqvlog("w3c validate error %o : %s : %s",
                                    jqXHR,
                                    textStatus, thrownError);
                            $(settings.divSelector).html('');
                            $(settings.divSelector).append('<p>' +
                                    thrownError + '</p>');
                            $(settings.divSelector).append('<p>' +
                                    'An error occurred accessing the ' +
                                    'validator at ' + settings.url +
                                    '.  Ensure the validator' +
                                    ' exists, and that it is on the same ' +
                                    'host as the script using it.' +
                                    thrownError + '</p>');
                        }
                    });
                }
            });   // END ajaxSuccess hook
        }  // END w3cValidate plugin
    });
}(jQuery));

/*!FOUNDATION cinci.namespace.js */
/*
====================================================================
 Blackbaud ISD Custom Javascript
--------------------------------------------------------------------
 Client: University of Cincinnati
 Author(s): J. Schultz
 Product(s): BBIS
 Created: 2/9/2015
 Updated: 7/29/2015 (by Nick Fogle)
--------------------------------------------------------------------
 Changelog:
====================================================================
 07/23/2015  Nick Fogle - Updated Alumni site root path for API calls
 07/29/2015  Nick Fogle - Refactored Plugin Functions
====================================================================
*/

/*
===================================================
 PLUGINS
---------------------------------------------------
 Additional plugins can be found on DropBox, under:
 Design Team > Javascript > Plugins
---------------------------------------------------
*/

// Insert plugins here...
(function($) {
    $.fn.rssfeed = function(url, options, fn) {
        // plugin defaults
        var defaults = {
            ssl: false,
            limit: 10,
            showerror: true,
            errormsg: '',
            date: true,
            dateformat: 'default',
            titletag: 'h4',
            content: true,
            snippet: true,
            snippetlimit: 120,
            linktarget: '_self'
        };
        // extend options
        options = $.extend(defaults, options);
        // return functions
        return this.each(function(i, e) {
            var s = '';
            // Check for SSL protocol
            if (options.ssl) {
                s = 's';
            }
            // add class to container
            if (!$(e).hasClass('rssFeed')) {
                $(e).addClass('rssFeed');
            }
            // check for valid url
            if (url === null) {
                return false;
            }
            // create yql query
            var query = 'http' + s + '://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from feed where url="' + url + '"');
            if (options.limit !== null) {
                query += ' limit ' + options.limit;
            }
            query += '&format=json';
            // send request
            $.getJSON(query, function(data, status, errorThrown) {
                // if successful... *
                if (status === 'success') {
                    // * run function to create html result
                    process(e, data, options);

                    // * optional callback function
                    if ($.isFunction(fn)) {
                        fn.call(this, $(e));
                    }

                    // if there's an error... *
                } else if (status === 'error' || status === 'parsererror') {
                    // if showerror option is true... *
                    if (options.showerror) {
                        // variable scoping (error)
                        var msg;

                        // if errormsg option is not empty... *
                        if (options.errormsg !== '') {
                            // * assign custom error message
                            msg = options.errormsg;

                            // if errormsg option is empty... *
                        } else {
                            // * assign default error message
                            msg = errorThrown;
                        }

                        // * display error message
                        $(e).html('<div class="rssError"><p>' + msg + '</p></div>');

                        // if showerror option is false... *
                    } else {
                        // * abort
                        return false;
                    }
                }
            });
        });
    };

    // create html result
    var process = function(e, data, options) {
        // Get JSON feed data
        var entries = data.query.results.item;
        // abort if no entries exist
        if (!entries) {
            return false;
        }
        // html variables
        var html = '';
        var htmlObject;
        // for each entry... *
        $.each(entries, function(i) {
            // * assign entry variable
            var entry = entries[i];
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var pubDate;
            var titlelink = entry.title.replace(/[^\w\s]/gi, '');
            var categoryClasses = ' ' + entry.categories.toString().replace(/ &amp; /g, ' ').replace(/ /g, '-').replace(/,/g, ' ');
            // if date option is true... *
            if (entry.pubDate) {
                // * create date object
                var entryDate = new Date(entry.pubDate);
                // * select date format
                if (options.dateformat === 'default') {
                    pubDate = (entryDate.getMonth() + 1).toString() + '/' + entryDate.getDate().toString() + '/' + entryDate.getFullYear();
                } else if (options.dateformat === 'spellmonth') {
                    pubDate = months[entryDate.getMonth()] + ' ' + entryDate.getDate().toString() + ', ' + entryDate.getFullYear();
                } else if (options.dateformat === 'localedate') {
                    pubDate = entryDate.toLocaleDateString();
                } else if (options.dateformat === 'localedatetime') {
                    pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();
                }
            }
            // * build entry
            html += '<div class="storyTileOuterWrapper"><div class="storyTileInnerWrapper" data-tag="' + tags + '">';
            html += '<div class="storyTileTextWrapper"><div class="storyTileTitle"><' + options.titletag + '><a href="' + entry.link + '" title="View this feed at ' + entries.title + '">' + entry.title + '</a></' + options.titletag + '>';
            if (options.date && pubDate) {
                html += '<div class="storyTileDate">' + pubDate + '</div>';
            }
            // if content option is true... *
            if (options.content) {
                var content = entry.description;
                html += '<div class="storyTileDescription">' + content + '</div>';
            }
            html += '</div>';
        });
        // provisional html result
        htmlObject = $(html);
        htmlObject.find('.storyTileInnerWrapper').each(function() {
            $(this).prepend('<div class="storyTileImage">');
            $(this).find('.storyTileImage').prepend($(this).find('img').first());
        });
        $(e).append(htmlObject);
        // Apply target to links
        $('a', e).attr('target', options.linktarget);
    };
})(jQuery);

var serverMonth = $(".BBDonationApiContainer").attr("serverMonth") - 1;
var serverDay = $(".BBDonationApiContainer").attr("serverDay");
var serverYear = $(".BBDonationApiContainer").attr("serverYear");
var ServerDate = new Date(serverYear, serverMonth, serverDay);

var BBI = BBI || {
    Config: {
        version: 1.0,
        updated: '12/22/2015 4:30 PM',
        isEditView: !!window.location.href.match('pagedesign'),
        slideshowRan: false
    },
    Defaults: {
        // we have to remove alumni from rootpath, otherwise it won't hit the API Endpoint
        rootpath: (function() {
            var str = BLACKBAUD.api.pageInformation.rootPath;
            var shortString = str.substring(0, str.lastIndexOf("alumni"));
            return shortString;
        })(),
        pageName: $.trim($(document).find("title").text()),
        partId: $(".BBDonationApiContainer").data("partid"),
        pageId: BLACKBAUD.api.pageInformation.pageId,
        // merchant account
        MerchantAccountId: "864426b2-20a0-43aa-95f6-c850d757b026",
        // this should be set to the GUID of the desingation query for the ADF
        // designationQueryId: "2191ed19-82c5-4941-ad15-39598e90d66d",
        // this should be set the GUID of the designation query that returns highlighted areas
        highlightedFundsQueryId: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === "https://www.alumni.uc.edu/") {
                return "c832a72a-813b-4d01-8606-3cfe8cd9b756";
            } else {
                return "66fcd70c-bbfb-4a99-97da-6efa4370624e";
            }
        })(),
        // the funds to be included in the cascading dropdown
        cascadingFundsQueryId: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === "https://www.alumni.uc.edu/") {
                return "73136bc9-4d41-4abb-a6fc-ff44fc5cb595";
            } else {
                return "5ccf0e08-69e1-4d23-9882-601100a43b4b";
            }
        })(),
        // this should be set to the GUID of the Fund that greatest need gifts are applied to
        greatestNeedFund: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === "https://www.alumni.uc.edu/") {
                return "898c3603-1440-4b38-9145-19d79effeb2c";
            } else {
                return "7318410e-17bd-4d1f-8437-d5742754a93a";
            }
        })(),
        // this should be set to the GUID of the pledge fund
        pledgeFund: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === "https://www.alumni.uc.edu/") {
                return "c21f1095-b071-4107-8942-0f1af860ea97";
            } else {
                return "6f0e4d60-1df1-495a-9e01-82b3e9d91aff";
            }
        })(),
        // this should be set to the GUID of the Fund that free text gifts are applied to
        generalFreeFormFund: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === "https://www.alumni.uc.edu/") {
                return "c21f1095-b071-4107-8942-0f1af860ea97";
            } else {
                return "6f0e4d60-1df1-495a-9e01-82b3e9d91aff";
            }
        })(),
        // the funds to be included in the cascading dropdown || Pre-populated Link Generator
        advancedDonationFormFundsQueryId: (function() {
            if (BLACKBAUD.api.pageInformation.rootPath === "https://www.alumni.uc.edu/") {
                return "d54d11f0-3f9c-4d63-91a8-fecf1f06944c";
            } else {
                return "b0e28c08-4081-4328-91f5-8509243f5d79";
            }
        })(),
        
        // Minimum gift amounts
        minGiftAmount: 5,
        minInstallmentAmount: 5,

        // GUID for membership fund
        // membershipFundId: "bcf8cd1a-0a22-4f2f-bd14-8040a272d6ed",
        // this should be set to the GUID of the Merchant account (unused - payment part)
        // MerchantAccountId: "864426b2-20a0-43aa-95f6-c850d757b026",
        newsFeedUrl: "https://foundation.uc.edu/feed.rss?id=1",
        customADFAttributes: {
            "Tribute Gift Type": "7b877e86-532a-4851-a1b1-7cd777fd08ec",
            "Honoree Name": "6337f9a2-c611-47f9-a81c-bcb01f457467",
            "Acknowledgee Title": "446bf4a6-e365-468d-bad0-37ce30b0e188",
            "Acknowledgee First Name": "91ca3e25-5831-40fe-9b7a-957f9608b8dd",
            "Acknowledgee Last Name": "3a7e79d5-f5f7-4fd8-8031-77f56b08b255",
            "Acknowledgee Address": "16a044a1-2171-4d1d-8029-48d4cba9f5dc",
            "Acknowledgee City": "f2a00e58-4d26-4c5f-a3c2-9403eb50bd18",
            "Acknowledgee State": "44b0f3c0-c4d6-4343-8355-943fb4703990",
            "Acknowledgee Zip": "f20b1f0b-14a1-40fe-94a6-1c6362db1d17",
            "Acknowledgee Country": "cca52f5c-97eb-4a5d-b3ac-4d7ed9b036a4",
            "Acknowledgee Phone": "030061fe-6a62-4e4d-8129-bc0b60f1ea00",
            "Acknowledgee Email": "93973031-17fc-49d2-a676-70544930a874",
            "UC Graduation Year": "b603114f-2669-400e-a870-186f9b923e08",
            "UC Graduation Degree": "64f2b303-e27a-419c-820f-676674b3004e",
            "Joint Spouse Name": "3a49afdd-9180-40a7-9c31-03ed83736388",
            "Matching Gift Company": "cce2f315-6ba7-4713-891b-5b2c4b422cc6",
            "Pledge ID": "01d9e45d-533f-4759-ba10-07fd687a202c"
        },
        monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        titleTable: "456ffd4c-0fbf-49db-a503-0726f86e2a39",
        defaultCountry: "4fc81243-c3ac-4ad8-be11-721be5795482",

        // server date
        serverDate: new Date($(".BBDonationApiContainer").attr("serveryear"), $(".BBDonationApiContainer").attr("servermonth") - 1, $(".BBDonationApiContainer").attr("serverday")),

        // keys
        publicKey: "",
        hepKey: "c158149ee05a1",

        // checkout overlay
        // opened: false,
        editorContent: "",
        checkoutError: "",
        // checkoutError: 'There was an error while performing the operation. The page will be refreshed.',

        // order id
        orderId: "",

        amounts: [50, 100, 250, 500, 1000, 1500, 2500, 5000],

        // custom attributes
        comments: "e3fe7cf0-7ffd-447a-979d-e73467ef94d6",
        matchingGift: "6840aed0-b85c-41c0-bb06-35df318abf0f",
        matchingGiftCompanyName: "cce2f315-6ba7-4713-891b-5b2c4b422cc6",

        // Faculty/Staff donation fields
        // update on Production site
        payrollDeductionFrequency: "e27106ea-1e71-42ba-9903-33cd6913613f",
        // doNotStartUntilExistingCompleted: "e01f28f7-c974-4362-af8a-286d6fc4c69d",
        payrollDeductionMNumber: "d3b28f46-5db5-4e83-8d40-42313da72d42",
        payrollDeductionStartDate: "196d3998-dfa3-4102-9509-f054f9108aad",
        payrollDeductionEndDate: "5eeef269-4e82-4453-bffc-78d92943fe64",

        pdStartAfterCurrentPledge: "88d9ba6c-37e9-43ef-ade2-136b76869e30",
        wantOrnament: "91d36eff-a262-4a76-ac04-66d0ee8210ef",
        givingTuesdayAmbassador: "7ef87b57-dfbc-4d12-9553-a3095cb02c25",
        anonymousGift: "e93b3b57-4cee-4ac9-ac9a-20a7736d5bb8",
        employer: "126739cb-50c9-4f1f-8c69-31a5625cbb3f",

        // Acknowledgee information
        AcknowledgeeTitle: "446bf4a6-e365-468d-bad0-37ce30b0e188",
        AcknowledgeeFirstName: "91ca3e25-5831-40fe-9b7a-957f9608b8dd",
        AcknowledgeeLastName: "3a7e79d5-f5f7-4fd8-8031-77f56b08b255",
        AcknowledgeeSuffix: "966325b2-e253-448f-bd59-857d0bcb63bd",
        AcknowledgeeCity: "f2a00e58-4d26-4c5f-a3c2-9403eb50bd18",
        AcknowledgeeCountry: "cca52f5c-97eb-4a5d-b3ac-4d7ed9b036a4",
        AcknowledgeeEmail: "93973031-17fc-49d2-a676-70544930a874",
        AcknowledgeePhone: "030061fe-6a62-4e4d-8129-bc0b60f1ea00",
        AcknowledgeeState: "44b0f3c0-c4d6-4343-8355-943fb4703990",
        AcknowledgeeStreetAddress: "16a044a1-2171-4d1d-8029-48d4cba9f5dc",
        AcknowledgeeZipCode: "f20b1f0b-14a1-40fe-94a6-1c6362db1d17",
        AcknowledgeeHonorName: "6337f9a2-c611-47f9-a81c-bcb01f457467",
        AcknowledgeeTributeGiftType: "7b877e86-532a-4851-a1b1-7cd777fd08ec"
    },
    Methods: {
        pageInit: function() {
            //All functions which should run instantly
            BBI.Methods.menuToggles();
            //Style fixes in admin view
            if (BBI.Config.isEditView) {
                BBI.Methods.adminStyleFixes();
            } else {
                BBI.Methods.headScripts();
                BBI.Methods.navScripts();
                BBI.Methods.vimeoScripts();
                if ($("#linkGeneratorForm").length !== 0) {
                    BBI.Methods.prepopulatedLinkGenerator();
                }
                // BBI.Methods.standardDonationScripts();
                BBI.Methods.checkoutScripts();
                BBI.Methods.initADF();
                BBI.Methods.tabbedComponent();
                // BBI.Methods.animatedGallery(); component not currently being used
                BBI.Methods.modalScripts();
                BBI.Methods.videoPlayer();
                BBI.Methods.datePicker();
                BBI.Methods.foundationbgFix();
                BBI.Methods.buildSocialButtons();
                BBI.Methods.createMenuSVG();
                BBI.Methods.initAccordions();
                BBI.Methods.subNavScroll();
                BBI.Methods.newsAndCalendarFeed();
                BBI.Methods.designationSearchFormat();
                BBI.Methods.initEventWrapper();
                BBI.Methods.designationSearchBoxes();
                BBI.Methods.replaceBoxgridTables();
                BBI.Methods.donationAmount();
                BBI.Methods.coerStyles();
                BBI.Methods.initMobileHeader();
                BBI.Methods.mobileSubMenu();
                BBI.Methods.jobOpportunities();
                BBI.Methods.footerBgScript();
                // NEW DONATION FORM
                BBI.Methods.customSingleDonationForm.tbodyClasses();
                BBI.Methods.customSingleDonationForm.stepOneGivingDetails.fundDesignationOption();
                BBI.Methods.customSingleDonationForm.stepOneGivingDetails.clickHiddenAmount();
                BBI.Methods.customSingleDonationForm.stepOneGivingDetails.donationAmount();

                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingTitleList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingName();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingAddress();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCity();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCountryList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingStateList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingZip();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingPhone();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingEmail();

                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.autoFillExtraction();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.hiddenDataPersistence();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardholder();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardNumber();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardExp();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.cardCSC();
                BBI.Methods.customSingleDonationForm.stepThreePaymentInfo.submitButton();
                BBI.Methods.customSingleDonationForm.stepToggles();
                BBI.Methods.customSingleDonationForm.hiddenFormValidation();
                $("iframe[id*= twitter]").css("display", "inline-block");
            }
            //end instant functions
            //Runs on partial page refresh
            Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(function() {
                BBI.Methods.pageRefresh();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCountryList();
                BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingStateList();
            });
            //Runs on full page
            $(document).ready(function() {
                BBI.Methods.pageLoad();
            });
        },

        pageRefresh: function() {
            // Runs on partial page refresh
            BBI.Methods.coerStyles();
            BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingCountryList();
            BBI.Methods.customSingleDonationForm.stepTwoDonorInfo.billingStateList();

            // Keep Sidebar open for Postbacks on Mobile
            if ($(".mobileCanvas.show-for-small:visible").length && $("tbody[id$=tbdForgotPWDUserName]").length) {
                $(".leftCanvas").toggleClass("expanded", 1000, "easeInOutQuart");
                $(".rightCanvas").toggleClass("retracted", 1000, "easeInOutQuart");
            }
            // Hide New User Prompt if Already Signed In
            if ($(".mobileCanvas.show-for-small:visible").length && $("input[id$=btnLogout]").length) {
                $(".mobileCanvas .offcanvasReg").hide();
            }
        },

        pageLoad: function() {
            // Runs on full page load
            if (!BBI.Config.isEditView) {
                this.foundationMediaOverlay();
            }
            //add search placeholder
            $('#ucBand input[id*="_txtQuickSearch"]').attr('placeholder', 'Search UC');
            $('.mobileCanvas .QuickSearchTextbox').prop('placeholder', 'Search UC Foundation');
            // payment part 2.0 functions
            if ($('.PaymentPart_FormContainer').length > 0) {
                // remove payment part links
                $('.PaymentPart_CartCell.PaymentPart_CartDescriptionCell > a').contents().unwrap().wrap('<span></span>');
                $(".PaymentPart_CartItemDetails:has('div')").prevAll().hide();

                // change "Other" designation text
                if ($('.wrapButtons a:contains("Make Another Gift")').length === 0) {
                    var des = $('.PaymentPart_CartCell.PaymentPart_CartDescriptionCell').find('span:contains("Other")');
                    if (des.length !== 0) {
                        $(des).text('Pledge Payment');
                    }
                }
            }
        },

        headScripts: function() {
            $("link[href*='stylesheet6']").attr("disabled", "disabled");
            // console.log("headScripts");
        },

        navScripts: function() {

            // Search placeholder scripts
            $(".SearchTextBox, .QuickSearchTextbox").attr("placeholder", "Search UC Foundation site");

            $(".nav.flex.main").attr("role", "list");

            var searchSvg = '<svg class="searchIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.14 49.94" fill="#222"><g><path  d="M24.46,0A21.88,21.88,0,0,1,37.87,4.66c3.72,3,5.76,6.73,5.17,11.66a24.31,24.31,0,0,0,0,4.18c.24,4.74-1.9,8.31-5.54,11.05-5,3.75-10.68,4.84-16.77,4.3a15.07,15.07,0,0,1-3.41-.62c-1.12-.37-1.59,0-2.13,1-2.21,3.87-4.5,7.7-6.79,11.53a4.37,4.37,0,0,1-4.69,2.15A4.46,4.46,0,0,1,.09,46.3a4.78,4.78,0,0,1,.73-3.54C3.06,39,5.26,35.21,7.53,31.46a1.15,1.15,0,0,0-.19-1.71,11.19,11.19,0,0,1-3.55-7.86A68.13,68.13,0,0,1,4,13.08c.5-4.4,3.26-7.41,6.89-9.68C14.74,1,19,0,24.46,0Zm-2,25.8c6.28,0,11-1.67,14.18-4.63,4-3.74,4.14-9,.26-12.87A17.26,17.26,0,0,0,26.27,3.56C21,3,16,3.81,11.59,7c-5.7,4.13-5.82,10.62-.29,15A18.58,18.58,0,0,0,22.45,25.8Zm-4.53,6.05a.58.58,0,0,0,.22.12c6.27,1.39,12.17.65,17.45-3.22a9.58,9.58,0,0,0,3.76-5.42C33.09,28.81,25.9,30,18.24,28.74ZM15,29.78c-.29-.32-.61-.92-.89-.9a2,2,0,0,0-1.4.71c-3,4.91-5.88,9.85-8.81,14.78-.41.7-.72,1.45.14,2s1.35-.17,1.76-.85l8.64-14.6C14.65,30.6,14.79,30.27,15,29.78Zm-4-3.78L7.53,23.26l-.29.2,2.37,4.09Z"/></g></svg>';

            $("ul.nav li.search a").attr("id", "search-toggle").attr("aria-label", "Search website").prepend(searchSvg).attr("aria-expanded", "false");

            var expandables = document.querySelector("#search-toggle");
            var searchToggle = document.querySelector(".search-toggle");

            expandables.addEventListener("click", function(e) {
                e.preventDefault();
                var expanded = this.getAttribute("aria-expanded")
                if (expanded === "false") {
                    this.setAttribute("aria-expanded", "true");
                    searchToggle.setAttribute("aria-hidden", "false");
                    // $("#search-toggle").addClass("visible");
                } else {
                    this.setAttribute("aria-expanded", "false");
                    searchToggle.setAttribute("aria-hidden", "true");
                    // $("#search-toggle").removeClass("visible");
                }
            });

            $(".QuickSearchTextbox").attr("placeholder", "Search UC Foundation site");

            // Add Menu button to nav
            const svgNavigation = '<button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" hidden><svg height="21" viewBox="0 0 24 24" width="24" aria-hidden="true" style="color: inherit;"><path d="M3 13h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1zM3 7h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1zM3 19h18c0.552 0 1-0.448 1-1s-0.448-1-1-1h-18c-0.552 0-1 0.448-1 1s0.448 1 1 1z" fill="currentColor"></path></svg> Menu</button>';

            // Add Close button to mobile nav
            const closeNavigation = '<button id="nav-closeBtn" class="nav-closeBtn" hidden=""><svg height="21" viewBox="0 0 24 24" width="24" aria-hidden="true" style="color: inherit;" xmlns="http://www.w3.org/2000/svg"><path d="M 3 13 L 21 13 C 21.552 13 22 12.552 22 12 C 22 11.448 21.552 11 21 11 L 3 11 C 2.448 11 2 11.448 2 12 C 2 12.552 2.448 13 3 13 Z" style="transform-box: fill-box; transform-origin: 50% 50%;" transform="matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0)"></path><path d="M 3 13 L 21 13 C 21.552 13 22 12.552 22 12 C 22 11.448 21.552 11 21 11 L 3 11 C 2.448 11 2 11.448 2 12 C 2 12.552 2.448 13 3 13 Z" style="transform-origin: 12px 12px;" transform="matrix(0.707107, -0.707106, 0.707106, 0.707107, 0, 0)"></path></svg> Close</button>';

            $("#site-nav").prepend(svgNavigation);
            $("#nav-content").prepend(closeNavigation);

            var utils = {
                generateID: function(base) {
                    return base + Math.floor(Math.random() * 999);
                },
                focusIsInside(element) {
                    return element.contains(document.activeElement);
                }
            };

            const icon = `<svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.293 9.707l6 6c0.391 0.391 1.024 0.391 1.414 0l6-6c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-5.293 5.293-5.293-5.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414z"></path></svg>`;

            const nav = document.getElementById("site-nav");
            nav.classList.add("enhanced");
            const navButton = document.getElementById("nav-toggle");
            const navCloseBtn = document.getElementById("nav-closeBtn");
            const navContent = document.getElementById("nav-content");
            const isDesktop = window.matchMedia("(min-width: 981px)");
            const main = document.getElementById("main");
            const footer = document.getElementById("main-footer");
            const header = document.getElementById("main-header");
            const siblings = document.querySelectorAll("header > *:not(nav)");

            let navIsShown = true;

            navCloseBtn.addEventListener("click", function(e) {
                e.preventDefault();
                // console.log("close me!");
                document.getElementById('search-toggle').setAttribute('aria-expanded', 'false');
                document.getElementById('search-container-toggle').setAttribute('aria-hidden', 'true');
                hideNav();
                navButton.focus();
                $("body").removeClass("no-scroll");
            }, false);

            function hideNav() {
                // nav.classList.add("closed");
                navButton.setAttribute("aria-expanded", "false");
                dropdowns.forEach(function(dropdown) {
                    dropdown.setAttribute("hidden", "");
                    let btn = dropdown.parentNode.querySelector("button");
                    btn.setAttribute("aria-expanded", "false");
                });
                document.getElementById('search-toggle').setAttribute('aria-expanded', 'false');
                document.getElementById('search-container-toggle').setAttribute('aria-hidden', 'true');

                navIsShown = false;
                makeNavInert();
                removePageInert();
            }

            function makePageInert() {
                if (main) {
                    main.setAttribute("inert", "");
                }
                if (footer) {
                    footer.setAttribute("inert", "");
                }

                /* 
                    for (var i = 0; i < siblings.length; i++) {
                    siblings[i].setAttribute("inert", "true");
                    } 
                */
            }

            function removePageInert() {
                if (main) {
                    main.removeAttribute("inert");
                }
                if (footer) {
                    footer.removeAttribute("inert");
                }

                for (var i = 0; i < siblings.length; i++) {
                    siblings[i].removeAttribute("inert");
                }
            }

            function makeNavInert() {
                navContent.setAttribute("inert", "");
            }

            function removeNavInert() {
                navContent.removeAttribute("inert");
            }

            function closeNavWhenFocusLeaves(element) {
                var firstClass = "js-first-focus";
                var lastClass = "js-last-focus";

                var tabFocusElements =
                    'button:not([hidden]):not([disabled]), [href]:not([hidden]), input:not([hidden]):not([type="hidden"]):not([disabled]), select:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled]), [tabindex="0"]:not([hidden]):not([disabled]), summary:not([hidden]), [contenteditable]:not([hidden]), audio[controls]:not([hidden]), video[controls]:not([hidden])';
                var focusable = element.querySelectorAll(tabFocusElements);

                // the first focusable element is the toggle button, but with the nav open, we don't want that one to be focused
                navCloseBtn.classList.add(firstClass);
                focusable[focusable.length - 1].classList.add(lastClass);

                element.addEventListener("keydown", function(e) {
                    var keyCode = e.keyCode || e.which;
                    var escKey = 27;
                    var tabKey = 9;

                    if (navIsShown) {
                        switch (keyCode) {
                            case escKey:
                                hideNav();
                                navButton.focus();
                                break;

                            default:
                                break;
                        }

                        if (navIsShown) {
                            var firstFocus = element.querySelector("." + firstClass);
                            var lastFocus = element.querySelector("." + lastClass);
                        }

                        if (document.activeElement.classList.contains(lastClass)) {
                            if (keyCode === tabKey && !e.shiftKey) {
                                e.preventDefault();
                                firstFocus.focus();
                            }
                        }

                        if (document.activeElement.classList.contains(firstClass)) {
                            if (keyCode === tabKey && e.shiftKey) {
                                e.preventDefault();
                                lastFocus.focus();
                            }
                        }
                    }
                });
            }

            // var top_level_items = document.querySelectorAll("li[data-has-children]");
            // var top_level_items = document.querySelectorAll("ul.nav > li.parent");
            // var dropdowns = document.querySelectorAll("li[data-has-children] > ul");
            // var dropdowns = document.querySelectorAll("li.parent > ul.nccUlMenuSub1");
            if ($(".mega-menu").length) {
                var top_level_items = document.querySelectorAll("li.parent");
                var dropdowns = document.querySelectorAll("li.parent > ul");
            } else {
                var top_level_items = document.querySelectorAll("ul.nav > li.parent");
                var dropdowns = document.querySelectorAll("li.parent > ul.nccUlMenuSub1");
            }

            var navID = utils.generateID("nav-");

            top_level_items.forEach(function(item, index) {
                const dropdown = item.querySelector(":scope > ul");
                dropdown.setAttribute("id", navID + "__ul-" + index);
                dropdown.setAttribute("hidden", "");

                // let span = item.querySelector(":scope > span");
                let span = item.querySelector(":scope > a");
                let text = span.innerText;

                let item_dw = document.createElement("button");
                item_dw.setAttribute("aria-expanded", "false");
                item_dw.setAttribute("aria-controls", navID + "__ul-" + index);
                item_dw.innerText = text;
                item_dw.innerHTML += icon;
                span.replaceWith(item_dw);
                item_dw.addEventListener("click", function(e) {
                    e.preventDefault();
                    toggleDropdown(item_dw, dropdown);
                });

                dropdown.addEventListener(
                    "keydown",
                    function(e) {
                        e.stopImmediatePropagation(); // so that only the list itself closes, not its parent list (in the case of 3+ levels deep nested links)
                        if (e.keyCode === 27 && utils.focusIsInside(dropdown)) {
                            toggleDropdown(item_dw, dropdown);
                            item_dw.focus();
                        }
                    },
                    false
                );
            });

            function toggleDropdown(dw, dropdown) {
                if (dw.getAttribute("aria-expanded") === "true") {
                    dw.setAttribute("aria-expanded", "false");
                    dropdown.setAttribute("hidden", "");
                } else {
                    dw.setAttribute("aria-expanded", "true");
                    dropdown.removeAttribute("hidden");
                }
                document.getElementById('search-toggle').setAttribute('aria-expanded', 'false');
                document.getElementById('search-container-toggle').setAttribute('aria-hidden', 'true');
            }

            function collapseDropdownsWhenClickingOutsideNav(e) {
                let target = e.target;
                dropdowns.forEach(function(dropdown) {
                    if (!dropdown.parentNode.contains(target)) {
                        dropdown.setAttribute("hidden", "");
                        let btn = dropdown.parentNode.querySelector("button");
                        btn.setAttribute("aria-expanded", "false");
                    }
                });
            }

            function collapseDropdownsWhenTabbingOutsideNav(e) {
                let target = e.target;
                if (e.keyCode === 9 && !utils.focusIsInside(nav)) {
                    dropdowns.forEach(function(dropdown) {
                        dropdown.setAttribute("hidden", "");
                        let btn = dropdown.parentNode.querySelector("button");
                        btn.setAttribute("aria-expanded", "false");
                    });
                }
            }

            function showNavigationContent() {
                navButton.setAttribute("aria-expanded", "true");
                navIsShown = true;
                removeNavInert();
                makePageInert();
                closeNavWhenFocusLeaves(navContent);
                navCloseBtn.focus();
                $("body").addClass("no-scroll");
            }

            // if user tabs out of the navigation, close all open dropdowns
            document.addEventListener("keyup", collapseDropdownsWhenTabbingOutsideNav);

            // if user clicks anywhere outside the navigation, close all open dropdowns
            window.addEventListener("click", collapseDropdownsWhenClickingOutsideNav);

            const handleResize = (e) => {
                if (e.matches) {
                    // is "desktop"
                    navContent.removeAttribute("hidden");
                    navButton.setAttribute("hidden", "");
                    navCloseBtn.setAttribute("hidden", "");

                    navContent.removeAttribute("role");
                    navContent.removeAttribute("aria-labelledby");

                    navCloseBtn.setAttribute("hidden", "");
                    removeNavInert();
                    removePageInert();
                } else {
                    navButton.removeAttribute("hidden");
                    navCloseBtn.removeAttribute("hidden");
                    navContent.setAttribute("role", "dialog");
                    navContent.setAttribute("aria-labelledby", "nav-toggle");

                    if (navIsShown) {
                        makeNavInert();
                    } else {
                        removeNavInert();
                    }

                    navButton.addEventListener("click", showNavigationContent, false);
                }
            };

            isDesktop.addEventListener("change", (e) => handleResize(e));
            handleResize(isDesktop);

        },

        vimeoScripts: function() {
            // Video Play/Pause functionality
            function initVimeoVideo() {
                var iframe = $("#player1")[0];
                var player = new Vimeo.Player(iframe);

                // Close using the close icon
                $(".pause").on("click", function(e) {
                    e.preventDefault();
                    var method = "pause";
                    player[method]();
                    $(".play, .pause").toggleClass("disabled");
                });

                // Close using the modal
                $(".play").on("click", function(e) {
                    e.preventDefault();
                    var method = "play";
                    player[method]();
                    $(".play, .pause").toggleClass("disabled");
                });
            }

            // function initControlVideo() {
            //     var iframe = document.getElementsByTagName("iframe")[0].contentWindow;

            //     $(".pause").on("click", function(e) {
            //         e.preventDefault();
            //         iframe.postMessage(
            //             '{"event":"command","func":"pauseVideo","args":""}',
            //             "*"
            //         );
            //         $(".play, .pause").toggleClass("disabled");
            //     });

            //     $(".play").on("click", function(e) {
            //         e.preventDefault();
            //         iframe.postMessage(
            //             '{"event":"command","func":"playVideo","args":""}',
            //             "*"
            //         );
            //         $(".play, .pause").toggleClass("disabled");
            //     });
            // }

            if ($(".hero.video-bg").length) {
                // initVimeoVideo();

                // initControlVideo();
            }
        },

        tabbedComponent: function() {

            if ($(".tabbed").length) {

                (function() {
                    // Get relevant elements and collections
                    const tabbed = document.querySelector(".tabbed");
                    const tablist = tabbed.querySelector("ul");
                    const tabs = tablist.querySelectorAll("a");
                    const panels = tabbed.querySelectorAll('[id^="section"]');

                    // The tab switching function
                    const switchTab = (oldTab, newTab) => {
                        newTab.focus();
                        // Make the active tab focusable by the user (Tab key)
                        newTab.removeAttribute("tabindex");
                        // Set the selected state
                        newTab.setAttribute("aria-selected", "true");
                        oldTab.removeAttribute("aria-selected");
                        oldTab.setAttribute("tabindex", "-1");
                        // Get the indices of the new and old tabs to find the correct
                        // tab panels to show and hide
                        let index = Array.prototype.indexOf.call(tabs, newTab);
                        let oldIndex = Array.prototype.indexOf.call(tabs, oldTab);
                        panels[oldIndex].hidden = true;
                        panels[index].hidden = false;
                    };

                    // Add the tablist role to the first <ul> in the .tabbed container
                    tablist.setAttribute("role", "tablist");

                    // Add semantics are remove user focusability for each tab
                    Array.prototype.forEach.call(tabs, (tab, i) => {
                        tab.setAttribute("role", "tab");
                        tab.setAttribute("id", "tab" + (i + 1));
                        tab.setAttribute("tabindex", "-1");
                        tab.parentNode.setAttribute("role", "presentation");

                        // Handle clicking of tabs for mouse users
                        tab.addEventListener("click", (e) => {
                            e.preventDefault();
                            let currentTab = tablist.querySelector("[aria-selected]");
                            if (e.currentTarget !== currentTab) {
                                switchTab(currentTab, e.currentTarget);
                            }
                        });

                        // Handle keydown events for keyboard users
                        tab.addEventListener("keydown", (e) => {
                            // Get the index of the current tab in the tabs node list
                            let index = Array.prototype.indexOf.call(tabs, e.currentTarget);
                            // Work out which key the user is pressing and
                            // Calculate the new tab's index where appropriate
                            let dir =
                                e.which === 37 ?
                                index - 1 :
                                e.which === 39 ?
                                index + 1 :
                                e.which === 40 ?
                                "down" :
                                null;
                            if (dir !== null) {
                                e.preventDefault();
                                // If the down key is pressed, move focus to the open panel,
                                // otherwise switch to the adjacent tab
                                dir === "down" ?
                                    panels[i].focus() :
                                    tabs[dir] ?
                                    switchTab(e.currentTarget, tabs[dir]) :
                                    void 0;
                            }
                        });
                    });

                    // Add tab panel semantics and hide them all
                    Array.prototype.forEach.call(panels, (panel, i) => {
                        panel.setAttribute("role", "tabpanel");
                        panel.setAttribute("tabindex", "-1");
                        let id = panel.getAttribute("id");
                        panel.setAttribute("aria-labelledby", tabs[i].id);
                        panel.hidden = true;
                    });

                    // Initially activate the first tab and reveal the first tab panel
                    tabs[0].removeAttribute("tabindex");
                    tabs[0].setAttribute("aria-selected", "true");
                    panels[0].hidden = false;
                })();
            }
        },

        animatedGallery: function() {

            // Gallery - Pinned image 
            if ($(".gallery").length) {
                const details = gsap.utils.toArray(".desktopContentSection:not(:first-child)");
                const photos = gsap.utils.toArray(".desktopPhoto:not(:first-child)");

                gsap.set(photos, {
                    yPercent: 101
                });

                const allPhotos = gsap.utils.toArray(".desktopPhoto");

                // create
                let mm = gsap.matchMedia();

                // add a media query. When it matches, the associated function will run
                mm.add("(min-width: 600px)", () => {
                    // this setup code only runs when viewport is at least 600px wide
                    // console.log("desktop");

                    ScrollTrigger.create({
                        trigger: ".gallery",
                        start: "top top",
                        end: "bottom bottom",
                        pin: ".right"
                    });

                    //create scrolltrigger for each details section
                    //trigger photo animation when headline of each details section
                    //reaches 80% of window height
                    details.forEach((detail, index) => {
                        let headline = detail.querySelector("h3");
                        let animation = gsap
                            .timeline()
                            .to(photos[index], {
                                yPercent: 0
                            })
                            .set(allPhotos[index], {
                                autoAlpha: 0
                            });
                        ScrollTrigger.create({
                            trigger: headline,
                            start: "top 80%",
                            end: "top 50%",
                            animation: animation,
                            scrub: true,
                            markers: false
                        });
                    });
                    return () => {
                        // optional
                        // custom cleanup code here (runs when it STOPS matching)
                        // console.log("mobile");
                    };
                });
            }

            /**
             * This script is for the skip link and to ensure that moving focus
             * via hashchange is respected in all browsers.
             */

            window.addEventListener("hashchange", function(e) {

                if (location.hash.substring(1) !== '') {
                    var el = document.getElementById(location.hash.substring(1));

                    if (el) {
                        if (!/^(?:a|select|input|button|textarea)$/i.test(el.tagName)) {
                            el.tabIndex = -1;
                        }
                        el.focus();
                    }
                }
            }, false);

        },

        modalScripts: function() {

            ;
            (function(w, doc, undefined) {
                'use strict';

                /**
                 * Local object for method references,
                 * define script metadata, and other
                 * global variables.
                 */
                var ARIAmodal = {};
                w.ARIAmodal = ARIAmodal;

                ARIAmodal.NS = 'ARIAmodal';
                ARIAmodal.AUTHOR = 'Scott O\'Hara';
                ARIAmodal.VERSION = '3.4.1';
                ARIAmodal.LICENSE = 'https://github.com/scottaohara/accessible_modal_window/blob/master/LICENSE';

                var activeClass = 'modal-open';
                var body = doc.body;
                var main = doc.getElementsByTagName('main')[0] || body;

                var modal = doc.querySelectorAll('[data-modal]');
                var children = doc.querySelectorAll('body > *:not([data-modal])');

                var initialTrigger;
                var activeModal;
                var useAriaModal = false;
                var returnToBody = false;

                var firstClass = 'js-first-focus';
                var lastClass = 'js-last-focus';

                var tabFocusElements = 'button:not([hidden]):not([disabled]), [href]:not([hidden]), input:not([hidden]):not([type="hidden"]):not([disabled]), select:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled]), [tabindex="0"]:not([hidden]):not([disabled]), summary:not([hidden]), [contenteditable]:not([hidden]), audio[controls]:not([hidden]), video[controls]:not([hidden])';

                /**
                 * Function to place the modal dialog(s) as the first child(ren)
                 * of the body element, so tabbing backwards will move focus
                 * into the browser's chrome.
                 */
                ARIAmodal.organizeDOM = function() {
                    var refEl = body.firstElementChild || null;
                    var i;

                    for (i = 0; i < modal.length; i++) {
                        body.insertBefore(modal[i], refEl);
                    }
                };

                /**
                 * Global Create
                 *
                 * This function validates that the minimum required markup
                 * is present to create the ARIA widget(s).
                 *
                 * Any additional markup elements or attributes that
                 * do not exist in the found required markup patterns
                 * will be generated setup functions.
                 */
                ARIAmodal.setupTrigger = function() {
                    var trigger = doc.querySelectorAll('[data-modal-open]');
                    var self;
                    var i;

                    for (i = 0; i < trigger.length; i++) {
                        self = trigger[i];
                        var getOpenTarget = self.getAttribute('data-modal-open');
                        var hasHref = self.getAttribute('href');

                        /**
                         * If not a button, update the semantics to make the element
                         * announce as a button and provide it a tabindex=0 to
                         * ensure it is keyboard focusable.
                         */
                        if (self.nodeName !== 'BUTTON') {
                            self.setAttribute('role', 'button');
                            self.tabIndex = 0;
                        }

                        /**
                         * If getOpenTarget was the empty string, but there is an
                         * href attribute, then get the possible target from the href
                         */
                        if (getOpenTarget === '' && hasHref) {
                            self.setAttribute('data-modal-open', hasHref.split('#')[1]);
                            getOpenTarget = hasHref.split('#')[1];
                        }

                        /**
                         * If an <a href> was changed to a role=button, then the context
                         * menu of the 'button' should no longer act as if it's for a link.
                         * Removing the href attribute will negate the link context menu
                         * if a user performs a right-click.
                         */
                        self.removeAttribute('href');

                        /**
                         * Check for if a data-modal-open attribute is on
                         * a button. If not, then the button targets nothing
                         * and there's not much that can be done with that.
                         */
                        if (getOpenTarget) {
                            /**
                             * A button should have an aria-haspopup="dialog" to convey to users that
                             * *this* button will launch a modal dialog.
                             *
                             * Presently, the "dialog" value is not fully supported and in unsupported
                             * instances, it defaults back to announcing that a "menu" will open.
                             * Use this attribute with caution until this value has wider support.
                             */
                            // self.setAttribute('aria-haspopup', 'dialog');

                            /**
                             * Remove the disabled attribute, as if this script is running, JavaScript
                             * must be enabled and thus the button should function.
                             *
                             * But wait...there may be value in having a disabled button that can be
                             * enabled via other user actions. So, in that scenario look for a
                             * data-modal-disabled attribute, to keep the button disabled.
                             */
                            if (self.hasAttribute('disabled') && !self.hasAttribute('data-modal-disabled')) {
                                self.removeAttribute('disabled');
                            }

                            /**
                             * In instances when JavaScript is unavailable and a disabled
                             * button is not desired, a hidden attribute can be used to
                             * completely hide the button.
                             *
                             * Remove this hidden attribute to reveal the button.
                             */
                            self.removeAttribute('hidden');

                            /**
                             * Get modal target and supply the button with a unique ID to easily
                             * reference for returning focus to, once the modal dialog is closed.
                             */
                            self.id = getOpenTarget + '__trigger-' + self.nodeName + '-' + i;

                            /**
                             * Events
                             */
                            self.addEventListener('click', ARIAmodal.openModal);
                            self.addEventListener('keydown', ARIAmodal.keyEvents, false);
                        } else {
                            console.warn('Missing target modal dialog - [data-modal-open="IDREF"]');
                        }
                    } // for(widget.length)
                }; // ARIAmodal.setupTrigger()

                /**
                 * Setup the necessary attributes and child elements for the
                 * modal dialogs.
                 */
                ARIAmodal.setupModal = function() {
                    var self;
                    var i;

                    for (i = 0; i < modal.length; i++) {
                        self = modal[i];
                        var modalType = self.getAttribute('data-modal');
                        var getClass = self.getAttribute('data-modal-class') || 'a11y-modal';
                        var heading = self.querySelector('h1, h2, h3, h4, h5, h6');
                        var modalLabel = self.getAttribute('data-modal-label');
                        var hideHeading = self.hasAttribute('data-modal-hide-heading');
                        var modalDesc = self.querySelector('[data-modal-description]');
                        var modalDoc = self.querySelector('[data-modal-document]');

                        /**
                         * Check to see if this is meant to be an alert or normal dialog.
                         * Supply the appropriate role.
                         */
                        if (modalType === 'alert') {
                            self.setAttribute('role', 'alertdialog');
                        } else {
                            self.setAttribute('role', 'dialog');
                        }

                        /**
                         * Set either the default dialog class or a class passed
                         * in from the data-modal-class attribute.
                         */
                        self.classList.add(getClass);

                        /**
                         * Modal dialogs need to be hidden by default.
                         *
                         * To ensure they stay hidden, even if CSS is disabled, or purposefully
                         * turned off, apply a [hidden] attribute to the dialogs.
                         */
                        self.hidden = true;

                        /**
                         * When a modal dialog is opened, the dialog itself
                         * should be focused. Set a tabindex="-1" to allow this
                         * while keeping the container out of the focus order.
                         */
                        self.tabIndex = '-1';

                        /**
                         * Older versions of NVDA used to automatically turn on forms mode
                         * when a user entered a modal dialog. A role="document", surrounding
                         * the content of the dialog would allow non-form dialogs to be
                         * navigated correctly by the virtual cursor.
                         *
                         * If a dialog needs to be compatible with older NVDA, look for
                         * a data-modal-document, and give that a role=document.
                         */
                        if (modalDoc) {
                            modalDoc.setAttribute('role', 'document');
                        }

                        /**
                         * Modal dialogs need at least one actionable item
                         * to close them...
                         */
                        ARIAmodal.setupModalCloseBtn(self, getClass, modalType);

                        /**
                         * The aria-modal attribute currently makes it difficult to navigate
                         * through the contents of a modal dialog with VoiceOver.
                         *
                         * Up/down arrows do not have access to all content, and
                         * using VO + left/right also do not have access to all
                         * content, but do have access to different content then
                         * up/down arrows alone.
                         *
                         * Note: The VoiceOver issues should be fixed with the release
                         * of Safari 12.
                         *
                         * Additionally, NVDA will mostly respect the aria-modal attribute
                         * with one notable bug, where if a user navigates to the address
                         * bar via NVDA key + F6, a user can re-enter document that is obscured
                         * by the open dialog, and can navigate the content 'beneath' the
                         * dialog with arrow keys, or quick keys.
                         *
                         * Using the tab key inconsistently returns a user to the modal
                         * dialog's contents, or may produce no keyboard focus change.
                         *
                         * This attribute can be added to a particular dialog if the
                         * dialog has a data-aria-modal attribute set.
                         */
                        if (self.hasAttribute('data-aria-modal')) {
                            self.setAttribute('aria-modal', 'true');
                        }

                        /**
                         * Do a check to see if there is an element flagged to be the
                         * description of the modal dialog.
                         */
                        if (modalDesc) {
                            modalDesc.id = modalDesc.id || 'md_desc_' + Math.floor(Math.random() * 999) + 1;
                            self.setAttribute('aria-describedby', modalDesc.id);
                        }

                        /**
                         * Check for a heading to set the accessible name of the dialog,
                         * or if an aria-label should be set to the dialog instead.
                         */
                        if (modalLabel) {
                            self.setAttribute('aria-label', modalLabel);
                        } else {
                            if (heading) {
                                var makeHeading = self.id + '_heading';
                                heading.classList.add(getClass + '__heading');
                                heading.id = makeHeading;

                                /**
                                 * Set an aria-labelledby to the modal dialog container.
                                 */
                                self.setAttribute('aria-labelledby', makeHeading);

                                if (heading.hasAttribute('data-autofocus')) {
                                    heading.tabIndex = '-1';
                                }
                            } else {
                                console.warn('Dialogs should have their purpose conveyed by a heading element (h1).');
                            }
                        }

                        /**
                         * If a dialog has a data-modal-hide-heading attribute, then that means this
                         * dialog's heading should be visually hidden.
                         */
                        if (hideHeading) {
                            self.querySelector('#' + heading.id).classList.add('at-only');
                        }

                        /**
                         * Get all focusable elements from within a dialog and set the
                         * first and last elements to have respective classes for later looping.
                         */
                        var focusable = self.querySelectorAll(tabFocusElements);
                        focusable[0].classList.add(firstClass);
                        focusable[focusable.length - 1].classList.add(lastClass);
                    }
                }; // ARIAmodal.setupModal

                /**
                 * Setup any necessary close buttons, and add appropriate
                 * listeners so that they will close their parent modal dialog.
                 */
                ARIAmodal.setupModalCloseBtn = function(self, modalClass, modalType) {
                    var doNotGenerate = self.hasAttribute('data-modal-manual-close');
                    var manualClose = self.querySelectorAll('[data-modal-close-btn]');
                    var modalClose = self.getAttribute('data-modal-close');
                    var modalCloseClass = self.getAttribute('data-modal-close-class');
                    var closeIcon = '<span data-modal-x></span>';
                    var btnClass = modalClass;
                    var i;

                    if (!doNotGenerate) {
                        if (manualClose.length < 2) {
                            var closeBtn = doc.createElement('button');
                            closeBtn.type = 'button';

                            /**
                             * If a custom class is set, set that class
                             * and create BEM classes for direct child elements.
                             *
                             * If no custom class set, then use default "a11y-modal" class.
                             */
                            self.classList.add(modalClass);
                            closeBtn.classList.add(modalClass + '__close-btn');

                            /**
                             * If there is no data-modal-close attribute, or it has no set value,
                             * then inject the close button icon and text into the generated button.
                             *
                             * If the data-modal-close attribute has a set value, then use that as the
                             * visible text of the close button, and do not position it in the upper right
                             * of the modal dialog.
                             */
                            if (!modalClose && modalType !== 'alert') {
                                closeBtn.innerHTML = closeIcon;
                                closeBtn.setAttribute('aria-label', 'Close');
                                closeBtn.classList.add('is-icon-btn');
                            } else {
                                closeBtn.innerHTML = modalClose;

                                if (modalCloseClass) {
                                    closeBtn.classList.add(modalCloseClass);
                                }
                            }

                            if (modalType !== 'alert') {
                                if (self.querySelector('[role="document"]')) {
                                    self.querySelector('[role="document"]').appendChild(closeBtn);
                                } else {
                                    self.appendChild(closeBtn);
                                }
                            }

                            closeBtn.addEventListener('click', ARIAmodal.closeModal);
                        }
                    }

                    for (i = 0; i < manualClose.length; i++) {
                        manualClose[i].addEventListener('click', ARIAmodal.closeModal);
                    }

                    doc.addEventListener('keydown', ARIAmodal.keyEvents, false);
                }; // ARIAmodal.setupModalCloseBtn

                /**
                 * Actions
                 */
                ARIAmodal.openModal = function(e, autoOpen) {
                    var i;
                    var getTargetModal = autoOpen || this.getAttribute('data-modal-open');
                    // Update the activeModal
                    activeModal = doc.getElementById(getTargetModal);

                    var focusTarget = activeModal; // default to the modal dialog container
                    var getAutofocus = activeModal.querySelector('[autofocus]') || activeModal.querySelector('[data-autofocus]');

                    useAriaModal = activeModal.hasAttribute('aria-modal');

                    /**
                     * If a modal dialog was auto-opened, then a user should
                     * be returned to the top of the document when the modal
                     * is closed, so that they do not have to figure out where
                     * they've been placed in the DOM
                     */
                    if (autoOpen) {
                        returnToBody = true;
                    }

                    /**
                     * If a modal was auto-opened on page load, then the
                     * following do not apply.
                     */
                    if (!autoOpen) {
                        /**
                         * In case these are links, negate default behavior and just
                         * do what this script tells these triggers to do.
                         */
                        e.preventDefault();

                        /**
                         * Keep track of the trigger that opened the initial dialog.
                         */
                        initialTrigger = this.id;
                    }

                    /**
                     * If a modal dialog contains an that is meant to be autofocused,
                     * then focus should be placed on that element (likely form control),
                     * instead of the wrapping dialog container.
                     *
                     * If a dialog has an attribute indicating the close button should
                     * be autofocused, focus the first close button found.
                     */
                    if (getAutofocus) {
                        focusTarget = getAutofocus;
                    } else if (activeModal.hasAttribute('data-modal-close-focus')) {
                        focusTarget = activeModal.querySelector('[class*="close-btn"]');
                    }

                    /**
                     * Do a check to see if a modal is already open.
                     * If not, then add a class to the body as a check
                     * for other functions and set contents other than
                     * the opened dialog to be hidden from screen readers
                     * and to not accept tab focus, nor for their child elements.
                     */
                    if (!body.classList.contains(activeClass)) {
                        body.classList.add(activeClass);

                        for (i = 0; i < children.length; i++) {
                            if (!useAriaModal) {
                                if (children[i].hasAttribute('aria-hidden')) {
                                    children[i].setAttribute('data-keep-hidden', children[i].getAttribute('aria-hidden'));
                                }
                                children[i].setAttribute('aria-hidden', 'true');
                            }

                            if (children[i].getAttribute('inert')) {
                                children[i].setAttribute('data-keep-inert', '');
                            } else {
                                children[i].setAttribute('inert', 'true');
                            }
                        }
                    } else {
                        console.warn('It is not advised to open dialogs from within other dialogs. Instead consider replacing the contents of this dialog with new content. Or providing a stepped, or tabbed interface within this dialog.');
                    }

                    activeModal.removeAttribute('hidden');

                    // Mostly reliable fix for iOS issue where VO focus is not moved
                    // to the dialog on open. Credit to Thomas Jaggi - codepen.io/backflip
                    // for the fix.
                    requestAnimationFrame(function() {
                        focusTarget.focus();
                    });

                    doc.addEventListener('click', ARIAmodal.outsideClose, false);
                    doc.addEventListener('touchend', ARIAmodal.outsideClose, false);

                    return [initialTrigger, activeModal, returnToBody];
                };

                /**
                 * Function for closing a modal dialog.
                 * Remove inert, and aria-hidden from non-dialog parent elements.
                 * Remove activeClass from body element.
                 * Focus the appropriate element.
                 */
                ARIAmodal.closeModal = function(e) {
                    var trigger = doc.getElementById(initialTrigger) || null;
                    var i;
                    var m;

                    /**
                     * Loop through all the elements that were hidden to
                     * screen readers, and had inert to negate their
                     * children from being focusable.
                     */
                    for (i = 0; i < children.length; i++) {
                        if (!children[i].hasAttribute('data-keep-inert')) {
                            children[i].removeAttribute('inert');
                        }

                        children[i].removeAttribute('data-keep-inert');

                        if (children[i].getAttribute('data-keep-hidden')) {
                            children[i].setAttribute('aria-hidden', children[i].getAttribute('data-keep-hidden'));
                        } else {
                            children[i].removeAttribute('aria-hidden');
                        }

                        children[i].removeAttribute('data-keep-hidden');
                    }

                    /**
                     * When a modal closes:
                     * the modal-open flag on the body can be removed,
                     * and the modal should be reset to hidden.
                     */
                    body.classList.remove(activeClass);

                    for (m = 0; m < modal.length; m++) {
                        if (!modal[m].hasAttribute('hidden')) {
                            modal[m].hidden = true;
                        }
                    }

                    /**
                     * Return focus to the trigger that opened the modal dialog.
                     * If the trigger doesn't exist for some reason, move focus to
                     * either the <main>, or <body> instead.
                     * Reset initialTrigger and activeModal since everything should be reset.
                     */
                    if (trigger !== null) {
                        trigger.focus();
                    } else {
                        if (main && !returnToBody) {
                            main.tabIndex = -1;
                            main.focus();
                        } else {
                            body.tabIndex = -1;
                            body.focus();
                        }
                    }

                    initialTrigger = undefined;
                    activeModal = undefined;
                    returnToBody = false;

                    return [initialTrigger, activeModal, returnToBody];
                };

                /**
                 * Keyboard controls for when the modal dialog is open.
                 * ESC should close the dialog (when not an alert)
                 */
                ARIAmodal.keyEvents = function(e) {
                    var keyCode = e.keyCode || e.which;
                    var escKey = 27;
                    var enterKey = 13;
                    var spaceKey = 32;
                    var tabKey = 9;
                    var firstFocus, lastFocus;

                    if (e.target.hasAttribute('data-modal-open')) {
                        switch (keyCode) {
                            case enterKey:
                            case spaceKey:
                                e.preventDefault();
                                e.target.click();
                                break;
                        }
                    }

                    if (body.classList.contains(activeClass)) {
                        switch (keyCode) {
                            case escKey:
                                ARIAmodal.closeModal();
                                break;

                            default:
                                break;
                        }

                        if (body.classList.contains(activeClass)) {
                            // Get first and last focusable elements from activeModal
                            firstFocus = activeModal.querySelector('.' + firstClass);
                            lastFocus = activeModal.querySelector('.' + lastClass);
                        }

                        if (doc.activeElement.classList.contains(lastClass)) {
                            if (keyCode === tabKey && !e.shiftKey) {
                                e.preventDefault();
                                if (firstFocus !== undefined) {
                                    firstFocus.focus();
                                }
                            }
                        }

                        if (doc.activeElement.classList.contains(firstClass)) {
                            if (keyCode === tabKey && e.shiftKey) {
                                e.preventDefault();
                                if (lastFocus !== undefined) {
                                    lastFocus.focus();
                                }
                            }
                        }
                    }
                }; // ARIAmodal.keyEvents()

                /**
                 * If a dialog is opened and a user mouse clicks or touch screen taps outside
                 * the visible bounds of the dialog content (onto the overlay 'screen') then
                 * the dialog should run the close function.
                 */
                ARIAmodal.outsideClose = function(e) {
                    if (body.classList.contains(activeClass) && !e.target.hasAttribute('data-modal-open')) {
                        var isClickInside = activeModal.contains(e.target);

                        if (!isClickInside && activeModal.getAttribute('role') !== 'alertdialog') {
                            ARIAmodal.closeModal();
                        }
                    }
                }; // ARIAmodal.outsideClose()

                /**
                 * Open a modal dialog on page load
                 */
                ARIAmodal.autoLoad = function() {
                    var getAuto = doc.querySelectorAll('[data-modal-auto]');
                    var hashValue = w.location.hash || null;
                    var autoOpen;
                    var useHash = false;
                    var e = null;

                    /**
                     * A modal ID in the URL should take precedent over any data attributes on
                     * the page. The script must first check if a hash exists, and then if so,
                     * does it match an ID in the document? And finally, is that ID associated
                     * with a modal dialog?  If so, set useHash to TRUE.
                     */
                    if (hashValue !== null) {
                        autoOpen = hashValue.split('#')[1];

                        // stop right here if a stray hash is at the end of the URL
                        if (autoOpen === '') {
                            return false;
                        } else if (autoOpen === '!null') {
                            return false;
                        } else {
                            // Check that the hash actually represent an element, or is it null?
                            var checkforDialog = doc.getElementById(autoOpen) || null;

                            // If not null...
                            if (checkforDialog !== null) {
                                // Do a final check to ensure the hash/ID is for a dialog or alertdialog
                                // and if so, return useHash as TRUE
                                if (checkforDialog.getAttribute('role') === 'dialog' || checkforDialog.getAttribute('role') === 'alertdialog') {
                                    useHash = true;
                                }
                            }
                        }
                    }

                    /**
                     * Since only a single modal should be open at a time, perform the following
                     * if/else checks:
                     *
                     * If a URL contains a fragment that matches the ID of a dialog, auto open it.
                     *
                     * Else If the attribute was found on a dialog container, then directly perform
                     * the openModal function.
                     *
                     * Else If a button or "button" was found with the attribute data-modal-auto,
                     * then perform a click to auto-open this dialog.
                     *
                     * If a dialog or button does not have the attribute data-modal-auto-persist,
                     * then update the URL fragment to a value that will not open a modal dialog on
                     * subsequent reloads.
                     *
                     * If data-modal-auto-persist does exist, then you can continue to bother your
                     * users with likely a poor user experience. :)
                     */

                    if (useHash) {
                        ARIAmodal.openModal(e, autoOpen);

                        if (getAuto.length > 1) {
                            console.warn('Only the modal indicated by the hash value will load.');
                        }
                    } else if (getAuto.length !== 0) {
                        if (getAuto[0].getAttribute('role') === 'dialog' || getAuto[0].getAttribute('role') === 'alertdialog') {

                            autoOpen = getAuto[0].id;
                            ARIAmodal.openModal(e, autoOpen);

                            if (getAuto.length > 1) {
                                console.warn('Multiple modal dialogs can not auto load.');
                            }
                        } else if (getAuto[0].getAttribute('role') === 'button' || getAuto[0].tagName === 'BUTTON') {
                            autoOpen = getAuto[0].id;
                            getAuto[0].click();
                        }
                    }

                    /**
                     * Ideally a user shouldn't have to be barraged with the same modal dialog over
                     * and over again, if they refresh their browser window.
                     *
                     * So unless the attribute "data-modal-auto-persist" exists, which should be used
                     * to specifically state that a particular dialog should continue to auto-load,
                     * regardless of page refresh, modify the URL fragment to a string that will
                     * not auto-load a modal.
                     */
                    if (getAuto.length !== 0 && !doc.getElementById(autoOpen).hasAttribute('data-modal-auto-persist')) {
                        w.location.replace("#!null");
                    }
                };

                /**
                 * Initialize modal functions.
                 * If expanding this script, put
                 * additional initialize functions here.
                 */
                ARIAmodal.init = function() {
                    ARIAmodal.organizeDOM();
                    ARIAmodal.setupTrigger();
                    ARIAmodal.setupModal();
                    ARIAmodal.autoLoad();
                };

                /**
                 * Go go JavaScript!
                 */
                ARIAmodal.init();

            })(window, document);

        },

        videoPlayer: function() {
            if ($(".video-list").length) {
                // Video Player
                var $list = $(".video-list > div");
                $list.click(function() {
                    $list.removeClass("active");
                    $(this).addClass("active");

                    var position = $($("iframe[name='video-player']")).offset().top;
                    $("body, html").animate({
                        scrollTop: position - 100
                    }, 700);
                });
            };
        },

        // fund list
        fundList: function() {
            // fund list container
            var fundList = $('#fundList'),
                areaSupportSelect = $("#areaSupportSelect"),
                collegeUnitSelect = $("#collegeUnitSelect"),
                collegeUnitToggle = $(".collegeUnitToggle"),
                fundToggle = $(".fundToggle"),
                fundSelect = $("#fundSelect");

            // designation variables
            var query = new BLACKBAUD.api.QueryService(),
                results = [];
            // data = BBI.Defaults.emergencyData;

            // filter unique values
            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }

            let areaToSupport = ["The UC Fund", "Scholarships", "UC Health", "Colleges/Units"];

            // get results
            query.getResults(BBI.Defaults.advancedDonationFormFundsQueryId, function(data) {
                // clean results
                var fields = data.Fields,
                    rows = data.Rows,
                    fieldArray = [];

                $.each(fields, function(key, value) {
                    fieldArray[value.Name] = key;
                });

                $.each(rows, function() {
                    var values = this.Values;
                    if (values[8] != "") {
                        results.push({
                            name: values[1], // values[3],
                            id: values[6], // values[4],
                            cat: values[8], // values[3],
                            subcat: values[9].substring(values[9].indexOf("-") + 1).trim() // values[3],
                        });
                    }
                });

                var count = 0;
                $.each(areaToSupport, function(key1, value) {
                    // build html structure for categories
                    areaSupportSelect.append('<option value="' + value + '" class="des-cat cat-' + key1 + '">' + value + '</option>');
                    count++;
                    if (count == areaToSupport.length) {
                        BBI.Methods.hideQueryLoader();
                    }
                });

                // filter unique values
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                // get categories
                var category = results.map(function(obj) {
                    return obj.cat;
                });

                // populate unique categories
                var uniqueCat = category.filter(onlyUnique);

                // uniqueCat.push(uniqueCat.shift());
                // uniqueCat.push(uniqueCat.shift());

                /*$.each(uniqueCat, function(key1, value1) {
                    // build html structure for categories
                    fundList.append('<div class="des-block"><div class="des-cat cat-' + key1 + '">' + value1 + '</div><div class="des-group"></div></div>');

                    // filter categories
                    var filterCat = $.grep(results, function(v) {
                        return v.cat === value1;
                    });

                    // get sub-categories from category filter
                    var subCategory = filterCat.map(function(obj) {
                        return obj.subcat;
                    });

                    // populate unique sub-categories
                    var uniqueSubCat = subCategory.filter(onlyUnique);
                    $.each(uniqueSubCat, function(key2, value2) {
                        // build html structure for sub-categories
                        if (value1 == 'The UC Fund' || value1 == 'Scholarships') {
                            fundList.find('.cat-' + key1).next().append('<div class="des-area one-level"><div class="des-subcat subcat-' + key2 + '" style="display: none"></div><div class="des-select" style="display: block"></div></div>');
                        } else {
                            fundList.find('.cat-' + key1).next().append('<div class="des-area"><div class="des-subcat subcat-' + key2 + '">' + value2 + '</div><div class="des-select"></div></div>');
                        }

                        // filter designations
                        var filterDes = $.grep(results, function(v) {
                            return v.cat === value1 && v.subcat === value2;
                        });

                        // populate designations
                        $.each(filterDes, function(key3, value3) {
                            var desId = value3.id,
                                desName = value3.name,
                                desCat = value3.cat,
                                desSubcat = value3.subcat,
                                desInput = desId + '-' + desName.replace(/(_|\W)/g, '').toLowerCase();

                            // build html structure for designations
                            fundList.find('.cat-' + key1).next().find('.subcat-' + key2).next().append('\
                                <div class="checkbox">\
                                    <input  type="checkbox"\
								            aria-labelledby="value-' + desId + '"\
                                            onfocus="parentFocus(event)"\
                                            onblur="parentBlur(event)"\
                                            tabindex="0"\
								            id="' + desId + '"\
                                            value="' + desId + '"\
								            onclick="checkboxPressed(event)"\
                                            data-cat="' + desCat + '"\
                                            data-subcat="' + desSubcat + '"\
								            aria-controls="giftSummary">\
                                    <label for="' + desId + '"\
								            id="value-' + desId + '">' + desName + '</label>\
                                </div>\
                            ');
                            // fundList.find('.cat-' + key1).next().find('.subcat-' + key2).next().append('<div class="checkbox"><input type="checkbox" id="' + desInput + '" value="' + desId + '" data-cat="' + desCat + '" data-subcat="' + desSubcat + '"><label for="' + desInput + '">' + desName + '</label></div>');
                        });
                    });
                });*/

                // BBI.Methods.hideQueryLoader();

                // run fund selection
                // BBI.Methods.fundCards();
            });

            // run fund selection
            BBI.Methods.fundCards();

            $(areaSupportSelect).on("change", function() {
                collegeUnitSelect.prop("selectedIndex", 0).find('option').not("option:first").remove();
                fundSelect.prop("selectedIndex", 0).find('option').not("option:first").remove();

                var selection = $(this).val();
                // filter categories based on selection
                var filterCat = $.grep(results, function(v) {
                    return v.cat === selection;
                });

                // get sub-categories from category filter
                var subCategory = filterCat.map(function(obj) {
                    return obj.subcat;
                });

                function Ascending_sort(a, b) {
                    return $(b)
                        .text().toUpperCase() < $(a)
                        .text().toUpperCase() ? 1 : -1;
                }

                // populate unique sub-categories
                var uniqueSubCat = subCategory.filter(onlyUnique);
                if (selection == "Colleges/Units") {
                    $(collegeUnitToggle).slideDown();
                    $(fundToggle).slideUp();

                    $.each(uniqueSubCat, function(key, value) {
                        var trimmedValue = value.substring(value.indexOf("-") + 1);
                        $(collegeUnitSelect).append($('<option value="' + value + '">' + trimmedValue + '</option>'));
                    });

                    var collegeUnitSelectVar = document.getElementById("collegeUnitSelect"),
                        fundSelectVar = document.getElementById("fundSelect");
                    collegeUnitSelectVar.disabled = false;
                    fundSelectVar.disabled = true;
                    collegeUnitSelectVar.setAttribute("selectedIndex", 0);

                    $(collegeUnitSelect).focus();
                    $("#collegeUnitSelect option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("#collegeUnitSelect");
                } else if (selection == "Scholarships" || selection == "The UC Fund" || selection == "UC Health") {
                    $(collegeUnitToggle).slideUp();
                    $(fundToggle).slideDown();

                    $.each(filterCat, function(key, value) {
                        $(fundSelect).append(
                            $(
                                '<option data-cat="' + value.cat + '" data-subcat="' + value.subcat + '" value="' +
                                value.id +
                                '">' +
                                value.name.split("(")[0].trim() +
                                '</option>'
                            )
                        );
                    });

                    var collegeUnitSelectVar = document.getElementById("collegeUnitSelect"),
                        fundSelectVar = document.getElementById("fundSelect");
                    collegeUnitSelectVar.disabled = true;
                    fundSelectVar.disabled = false;
                    collegeUnitSelectVar.setAttribute("selectedIndex", 0);

                    $(fundSelect).focus();
                    $("#fundSelect option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("#fundSelect");
                }
                // else if (selection == "Type your own fund") {
                //     $(".toggleOtherFund").slideDown();
                //     $("#otherArea").focus();

                //     var position = $($("#otherArea")).offset().top;
                //     $("body, html").animate({
                //             scrollTop: position - 60
                //         },
                //         700
                //     );
                // }
                else {
                    // do nothing
                }
            });

            // sub-category menu (level 2)
            $(collegeUnitSelect).on("change", function() {
                $(fundToggle).slideDown();

                // remove all options in designation menu except the first
                $(fundSelect).focus().prop("selectedIndex", 0).find("option").not("option:first").remove();

                // define category and sub-category selections
                var selection1 = $(areaSupportSelect).val();
                var selection2 = $(this).val();

                // filter designations based on category and sub-category selections
                var filterSubCat = $.grep(results, function(v) {
                    return v.cat === selection1 && v.subcat === selection2;
                });

                // populate designations
                $.each(filterSubCat, function(key, value) {
                    $(fundSelect).append(
                        $(
                            '<option data-cat="' + value.cat + '" data-subcat="' + value.subcat + '" value="' +
                            value.id +
                            '">' +
                            value.name.split("(")[0].trim() +
                            '</option>'
                        )
                    );
                });

                var fundSelectVar = document.getElementById("fundSelect");
                fundSelectVar.disabled = false;

                function Ascending_sort(a, b) {
                    return $(b)
                        .text().toUpperCase() < $(a)
                        .text().toUpperCase() ? 1 : -1;
                }

                $("#fundSelect option:not(:first)")
                    .sort(Ascending_sort)
                    .appendTo(fundSelect);
            });
        },

        // fund search
        fundSearch: function() {
            // typeahead variables
            var typeahead = $('#desSearch'),
                query = new BLACKBAUD.api.QueryService(),
                results = [];
            // data = BBI.Defaults.emergencyData;

            // console.log(data);

            // get results
            query.getResults(BBI.Defaults.advancedDonationFormFundsQueryId, function(data) {
                // clean results
                results = [];
                var fields = data.Fields,
                    rows = data.Rows,
                    fieldArray = [];

                $.each(fields, function(key, value) {
                    fieldArray[value.Name] = key;
                });

                $.each(rows, function() {
                    var values = this.Values;
                    results.push({
                        value: values[6],
                        label: values[0],
                        cat: values[8],
                        subcat: values[9]
                        // value: values[4],
                        // label: values[3],
                        // cat: values[1],
                        // subcat: values[2]
                    });
                });

                // initialize suggestion engine
                // var search = new Bloodhound({
                //     // datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label', 'cat', 'subcat'),
                //     datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
                //     queryTokenizer: Bloodhound.tokenizers.whitespace,
                //     local: results
                // });

                var search = new Bloodhound({
                    // datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label', 'cat', 'subcat'),
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    local: results,
                    sorter: function(a, b) {

                        //get input text
                        var InputString = $("#desSearch").val();

                        //move exact matches to top
                        if (InputString == a.value) {
                            return -1;
                        }
                        if (InputString == b.value) {
                            return 1;
                        }

                        //close match without case matching
                        if (InputString.toLowerCase() == a.value.toLowerCase()) {
                            return -1;
                        }
                        if (InputString.toLowerCase() == b.value.toLowerCase()) {
                            return 1;
                        }

                        if ((InputString != a.value) && (InputString != b.value)) {

                            if (a.value < b.value) {
                                return -1;
                            } else if (a.value > b.value) {
                                return 1;
                            } else return 0;
                        }
                    }
                });

                // initialize typeahead plugin
                var typeaheadInit = search.initialize();
                typeaheadInit.done(function() {
                    typeahead.typeahead({
                        highlight: true,
                        minLength: 2
                    }, {
                        display: 'label',
                        name: 'search',
                        source: search,
                        limit: 'Infinity',
                        templates: {
                            empty: function() {
                                return '<div class="no-match">No results found</div>';
                            },
                            suggestion: function(data) {
                                var categoryText = "";

                                if (data.cat) {
                                    categoryText = data.cat + ' / ';
                                } else {
                                    // categoryText
                                }
                                return '<div><p class="tt-label">' + data.label + '</p></div>';
                                // return '<div><p class="tt-hierarchy">' + categoryText + data.subcat.substring(data.subcat.indexOf("-") + 1).trim() + '</p><p class="tt-label">' + data.label + '</div>';
                                // return '<div><p class="tt-hierarchy">' + data.cat + ' / ' + data.subcat + '</p><p class="tt-label">' + data.label + '</div>';
                            }
                        }
                    }).on('typeahead:select', function(e, datum) {
                        $(this).data({
                            value: datum.value,
                            label: datum.label,
                            cat: datum.cat,
                            subcat: datum.subcat,
                            id: datum.value + '-' + datum.label.replace(/(_|\W)/g, '').toLowerCase()
                        });
                        BBI.Methods.addFund($(this));
                        clearSearch();
                    }).on('typeahead:change', function() {
                        if ($.trim($(this).typeahead('val')) === '') {
                            clearSearch();
                        }
                    });
                }).fail(function() {
                    console.log('unable to parse designation query');
                });

                // clear search field
                function clearSearch() {
                    typeahead.typeahead('val', '').typeahead('close');
                    typeahead.removeData();
                }

                // autopopulate designation from url
                var guid = BBI.Methods.returnQueryValueByName('fund');
                if (!!guid) {
                    var label = results.filter(function(obj) {
                        return obj.value === guid;
                    })[0].label;
                    typeahead.data('value', guid).typeahead('val', label);
                }
            });
        },

        // fund card events
        fundCards: function() {
            // designation category
            // $('.des-cat').each(function() {
            //     $(this).on('click', function() {
            //         $(this).toggleClass('expanded');
            //         $(this).next().slideToggle(200);
            //         if ($(this).hasClass('expanded')) {
            //             $(this).closest('.des-block').addClass('expanded');
            //         } else {
            //             $(this).closest('.des-block').removeClass('expanded');
            //         }
            //     });
            // });
            $('.des-cat').each(function() {
                $(this).on('click', function() {
                    $(this).toggleClass('expanded');

                    // toggle the aria expanded tag
                    if (this.getAttribute('aria-expanded') === 'true') {
                        this.setAttribute('aria-expanded', 'false');
                    } else {
                        this.setAttribute('aria-expanded', 'true');
                    }

                    // toggle the aria expanded tag and the expanded class for the parent designation block
                    $(this).next().slideToggle(200);
                    if ($(this).hasClass('expanded')) {
                        $(this).closest('.des-block').addClass('expanded');
                        this.closest('.des-block').setAttribute('aria-expanded', 'true');
                    } else {
                        $(this).closest('.des-block').removeClass('expanded');
                        this.closest('.des-block').setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // designation category (keyboard navigation)
            $('.des-cat').each(function() {
                $(this).on('keyup', function(e) {
                    // if the enter key  was pressed, expand the accordian and toggle expanded flags
                    if (e.which == 13) {
                        $(this).toggleClass('expanded');
                        if (this.getAttribute('aria-expanded') === 'true') {
                            this.setAttribute('aria-expanded', 'false');
                        } else {
                            this.setAttribute('aria-expanded', 'true');
                        }
                        $(this).next().slideToggle(200);
                        if ($(this).hasClass('expanded')) {
                            $(this).closest('.des-block').addClass('expanded');
                            this.closest('.des-block').setAttribute('aria-expanded', 'true');
                        } else {
                            $(this).closest('.des-block').removeClass('expanded');
                            this.closest('.des-block').setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            });

            // designation sub-category
            // $('.des-subcat').each(function() {
            //     $(this).on('click', function() {
            //         $(this).toggleClass('expanded');
            //         $(this).next().slideToggle(200);
            //     });
            // });

            $('.des-subcat').each(function() {
                $(this).on('click', function() {
                    $(this).toggleClass('expanded');
                    if (this.getAttribute('aria-expanded') === 'true') {
                        this.setAttribute('aria-expanded', 'false');
                    } else {
                        this.setAttribute('aria-expanded', 'true');
                    }
                    $(this).next().slideToggle(200);
                });
            });

            // designation sub-category (keyboard navigation)
            $('.des-subcat').each(function() {
                $(this).on('keyup', function(e) {
                    if (e.which == 13) {
                        $(this).toggleClass('expanded');
                        if (this.getAttribute('aria-expanded') === 'true') {
                            this.setAttribute('aria-expanded', 'false');
                        } else {
                            this.setAttribute('aria-expanded', 'true');
                        }
                        $(this).next().slideToggle(200);
                    }
                });
            });

            // designation selection
            // $('.des-select .checkbox label').on('click', function() {
            //     if (!$(this).prev('input').is(':checked')) {
            //         BBI.Methods.addFund($(this));
            //     } else {
            //         var id = $(this).prev('input').attr('id');
            //         BBI.Methods.removeFund(id);
            //     }
            // });

            // fund card event (blur)
            $('#giftSummary').on('blur', '.fund-card input', function() {
                if (!isNaN($(this).val())) {
                    if (Number($(this).val()) < 1.00) {
                        $(this).val('0.00');
                        if ($(this).next('.min-amount').length === 0) {
                            $(this).parent().append('<p class="min-amount">Please enter a minimum of $1.</p>');
                        }
                    } else {
                        if ($(this).next('.min-amount').length !== 0) {
                            $(this).next('.min-amount').remove();
                        }
                        var newVal = parseFloat($(this).val(), 10).toFixed(2);
                        $(this).val(newVal);
                        BBI.Methods.updateTotal();
                    }
                } else {
                    $(this).val('0.00');
                }
            });

            // fund card events (change keyup focusout input paste)
            $('#giftSummary').on('change keyup focusout input paste', '.fund-card input', function(e) {
                if (!isNaN($(this).val())) {
                    // update total amount
                    BBI.Methods.updateTotal();

                    // update pledge summary
                    if ($('#pledgeGift').is(':checked')) {
                        // BBI.Methods.pledgeSummary();
                    }
                }
            });

            // remove fund
            $('#giftSummary').on('click', '.remove-fund', function(e) {
                e.preventDefault();
                var id = $(this).closest('.fund-card').data('id');
                $('.des-select').find('#' + id).prop('checked', false);
                BBI.Methods.removeFund(id);

                // update pledge summary
                if ($('#pledgeGift').is(':checked')) {
                    // BBI.Methods.pledgeSummary();
                }
            });
        },

        totalAmountChange: function() {
            var cartTotal = $("#totalGift"),
                numberOfInstallments = $("#numberOfInstallments").val(),
                total = 0,
                newTotal,
                formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                });

            $('.fund-card input').each(function() {
                var amount = Number($(this).val());
                // console.log(amount);
                total += +parseFloat(amount, 10).toFixed(2);
            }).promise().done(function() {
                newTotal = parseFloat(total, 10).toFixed(2);
                cartTotal.val(formatter.format(newTotal));
            });
        
            if(numberOfInstallments > 0) {
            // console.log(numberOfInstallments);
                var n1 = $("#totalGift").val(),
                    n2 = $("#numberOfInstallments").val(),
                    regp = /[^0-9.-]+/g,
                    formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    });
            
                var installmentAmount = parseFloat(n1.replace(regp, '')) / parseFloat(n2.replace(regp, ''));
                installmentAmount = parseFloat(installmentAmount, 10).toFixed(2);
                $("#installmentAmount").val(formatter.format(installmentAmount));
            }

        },

        // add to cart
        addFund: function(elem) {
            // hide empty card
            if ($('.fund-card.empty').is(':visible')) {
                $('.fund-card.empty').addClass('hidden');
            }

            var designationGiftAmount = document.getElementById("otherAmtInput").value;

            // fund data
            var value, label, cat, subcat, id;
            if (elem.is('#desSearch')) {
                value = elem.data('value');
                label = elem.data('label');
                cat = elem.data('cat');
                subcat = elem.data('subcat');
                id = elem.data('id');

                // select corresponding checkbox in fund list
                $('.des-select').find('#' + id).prop('checked', true);
            } else if (elem.is('#fundSelect')) {
                value = $("#fundSelect option:selected").val();
                label = $("#fundSelect option:selected").text();
                cat = $("#fundSelect option:selected").data("cat");
                subcat = $("#fundSelect option:selected").data("subcat");
                id = $("#fundSelect option:selected").val();

                // value = elem.prev('input').val();
                // label = elem.text();
                // cat = elem.prev('input').data('cat');
                // subcat = elem.prev('input').data('subcat');
                // id = elem.prev('input').attr('id');
            } else if (elem.is('.add-other')) {
                value = $("#otherArea").data("guid");
                label = $("#otherArea").val();
                cat = "Other Fund";
                subcat = $("#otherArea").val();
                id = $("#otherArea").data("guid");

                $("#comments").val("Other Fund: " + label);
            }

            $("#otherArea").val("");

            // build fund card markup
            var card = $(
                '<div class="fund-card" data-id="' + id + '">' +
                // '<div class="fund-card-header">' +
                // '<p><span class="fund-cat">' + cat + '</span> / <span class="fund-subcat">' + subcat.substring(subcat.indexOf("-") + 1).trim() + '</span></p>' +
                // '</div>' +
                '<div class="fund-card-block">' +
                '<div class="roww">' +
                '<div class="g-55 t-g-22 relative remove-bottom"><p class="fund-name">' + label + '</p><p class="fund-guid hidden">' + value + '</p></div>' +
                // '<div class="g-3 t-g-2 relative remove-bottom"><p class="symbol">$</p><input class="adfInput form-control required" type="text" placeholder="0.00" value="' + designationGiftAmount + '" required></div>' +
                '</div>' +
                '</div>' +
                '<div class="fund-card-footer">' +
                '<div class="g-3 t-g-2 relative remove-bottom"><p class="symbol">$</p><input class="adfInput form-control required" type="text" placeholder="0.00" value="' + designationGiftAmount + '" required></div>' +
                '<a href="#" class="button remove-fund"  aria-label="Remove fund"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#e00122" d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg></a>' +
                '</div>' +
                '</div>'
            );

            // insert fund card
            card.insertBefore('.proc-fee');

            // update total amount
            BBI.Methods.updateTotal();

            BBI.Methods.totalAmountChange();

            // update pledge summary
            // if ($('#pledgeGift').is(':checked')) {
            //     BBI.Methods.pledgeSummary();
            // }

            function setSelectedIndex(s, valsearch) {
                // Loop through all the items in drop down list
                for (i = 0; i < s.options.length; i++) {
                    if (s.options[i].value == valsearch) {
                        // Item is found. Set its property and exit
                        s.options[i].selected = true;
                        break;
                    }
                }
                return;
            }           

            if ($('#dayofgiving').length !== 0) {
                // do nothing
            } else {
                setSelectedIndex(document.getElementById("areaSupportSelect"), "First select");
                setSelectedIndex(document.getElementById("collegeUnitSelect"), "First select");
                setSelectedIndex(document.getElementById("fundSelect"), "First select");

                $(".amounts .amount.selected").removeClass("selected");
                document.getElementById("otherAmtInput").value = "";

                $(".collegeUnitToggle, .fundToggle").css("display", "none");

                $(".amountsToggle, .giftDetailsToggle, .fund-list").slideUp();
                $("#divAddAnotherGiftButton").slideDown();
            }

            // BBI.Methods.addAnotherGift();
        },

        // Day of Giving
        addGift: function() {
            // Day of Giving template page
            console.log("Add Gift - Day of Giving template page");
            $('.add-another-gift').on('click', function (e) {
                e.preventDefault();
                var errorX = 0;

                if ($('#divIWantToSupport').is(':visible')) {
                    errorX = validateAmountFields(false);

                    if (errorX === 0) {
                        BBI.Methods.addToCart();
                        $('#divDesignationCategory').show();
                        $('#divDesignationPreDefined').hide();
                        $('#divIWantToSupport').show();
                        $('#divAddGiftButton').show();
                        $('#divAddAnotherGiftButton').hide();

                    } else {
                        // do nothing
                    }
                } else {
                    $('#divDesignationCategory').show();
                    $('#divDesignationPreDefined').hide();
                    $('#divIWantToSupport').show();
                    $('#divAddAnotherGiftButton').hide();
                }
            })

            function validateAmountFields(checkMinAmounts) {
                var errorX = 0;
                if ($('#divIWantToSupport').is(':visible')) {
                    if ($('#divDesignationCategory').is(':visible')) {
                        if ($('#ddlDesignationCategory').val() === '') {
                            console.log("#ddlDesignationCategory has an error!");
                            // $('#ddlDesignationCategory').addClass("has-error");
                            // $('#ddlDesignationCategory_Required').css('display', 'block');
                            errorX = errorX + 1;
                        } else {
                            if ($('#fundSelect').val() === '') {
                                console.log("#fundSelect has an error!");
                                // $('#ddlDesignationSpecific').addClass("has-error");
                                // $('#ddlDesignationSpecific_Required').css('display', 'block');
                                errorX = errorX + 1;
                            } else if ($('#ddlDesignationSpecific option:selected').text() === 'Other') {
                                if ($('#txtDesignationOther').val() === '') {
                                    console.log("#txtDesignationOther has an error!");
                                    // $('#txtDesignationOther').addClass("has-error");
                                    // $('#txtDesignationOther_Required').css('display', 'block');
                                    errorX = errorX + 1;
                                }
                            }
                        }
                    }

                    if ($('#otherAmtInput').val() === '' || parseFloat($('#otherAmtInput').val()) === 0) {
                        console.log("#otherAmtInput has an error!");
                        // $('#txtGiftAmountFormatted').addClass("has-error");
                        // $('#txtGiftAmountFormatted_Required').css('display', 'block');
                        errorX = errorX + 1;
                    }
                }

                if (checkMinAmounts) {
                    var currentAmount = $('#otherAmtInput').val();
                    var amount = 0.00;
                    var cart = 0.00;
                    var minGiftAmount = parseFloat(BBI.Defaults.minGiftAmount);
                    var minInstallmentAmount = parseFloat(BBI.Defaults.minInstallmentAmount);

                    // update total amount
                    if ($('#tblCartTable tbody').children().length === 0) {
                        amount = parseFloat(currentAmount);

                        if (amount < minGiftAmount && amount > 0.00) {
                            $('#txtGiftAmountFormatted_MinAmount').html('The minimum donation amount is $' + minGiftAmount.toFixed(2))
                            $('#txtGiftAmountFormatted_MinAmount').show();
                            $('#spanCartTotalAmount_MinAmount').hide();
                            $('.cart-total').removeClass('required-message');
                            errorX = errorX + 1;
                        } else {
                            // $('#txtGiftAmountFormatted_MinAmount').hide();
                        }

                    } else {
                        $('.fund-amount input').each(function () {
                            amount += +parseFloat(parseFloat($(this).val()).toFixed(2));
                        });
                        amount = parseFloat(amount);
                        $("#spanCartTotalAmount").text(numberWithCommas(amount.toFixed(2)));

                        if (amount < minGiftAmount && amount > 0) {
                            $('#spanCartTotalAmount_MinAmount').html('The minimum donation amount is $' + minGiftAmount.toFixed(2))
                            $('#spanCartTotalAmount_MinAmount').show();
                            $('.cart-total').addClass('required-message');
                            $('#txtGiftAmountFormatted_MinAmount').hide();
                            errorX = errorX + 1;
                        } else {
                            $('#spanCartTotalAmount_MinAmount').hide();
                            $('.cart-total').removeClass('required-message');
                        }
                    }

                    var type = $("#ddlGiftType option:selected").val();

                    if (type === "2") { // new pledge
                        var pledgeDuration = $("#ddlPledgeDuration option:selected").val();
                        var pledgeFrequency = $("#ddlPledgeFrequency option:selected").val();
                        var pledgePayments = pledgeDuration * pledgeFrequency;

                        if (parseFloat(amount / pledgePayments) < minInstallmentAmount) {
                            $('#tdPledgePerPayment_MinAmount').html('The minimum installment amount is $' + minInstallmentAmount.toFixed(2))
                            $('#tdPledgePerPayment_MinAmount').show();
                            $('#tdPledgePerPayment').addClass('required-message');
                            errorX = errorX + 1;
                        } else {
                            $('#tdPledgePerPayment_MinAmount').hide();
                            $('#tdPledgePerPayment').removeClass('required-message');
                        }
                    }
                }

                return errorX;
            }
        },

        // Day of Giving add to cart
        addToCart: function () {
            if ($('#otherAmtInput').val() !== '' && $('#otherAmtInput').val() !== '0.00') {
                // if ($('#fundSelect').val() !== '' || $('#txtDesignationPreDefined').attr('desid') !== '') {
                if ($('#fundSelect').val() !== '') {

                    // assign designation variables
                    var designationCategory = "";
                    var designationName = "";
                    var designationGuid = "";

                    if ($('#fundSelect').val() !== '') {
                        designationCategory = $('#areaSupportSelect').children(':selected').text();
                        designationName = $('#fundSelect').children(':selected').text();
                        designationGuid = $('#fundSelect').children(':selected').val();
                    } else if ($('txtDesignationPreDefined').val() !== '') {
                        designationCategory = $('#txtDesignationPreDefined').attr('parent');
                        designationName = $('#txtDesignationPreDefined').val();
                        designationGuid = $('#txtDesignationPreDefined').attr('desid');
                    } else {
                        console.log("ERROR - assign designation variables");
                        // designationCategory = ""
                        // designationName = $('#ddlDesignationPreDefined').children(':selected').text();
                        // designationGuid = $('#ddlDesignationPreDefined').children(':selected').val();
                    }

                    var designationAmountFormatted = $('#otherAmtInput').val();
                    var designationAmount = $('#otherAmtInput').val();
                    //var designationGiftType = $('#ddlGiftType').children(':selected').text();
                    var designationOther = $('#txtDesignationOther').val();

                    // add row to cart table
                    $('#divShoppingCart').show();
                    $('#tblCartTable tbody').append('<tr>' +
                        '<td class="fund-designation" style="display:none;">' +
                        designationGuid +
                        '</td>' +
                        '<td class="fund-category" style="display:none;">' +
                        designationCategory +
                        '</td>' +
                        '<td class="fund-name-displayed"><strong>' +
                        designationName +
                        '</strong>' +
                        // (designationOther.length > 0 ? '<br /><em>' + designationOther + '</em>' : '') +
                        '</td>' +
                        '<td class="fund-name" style="display:none;">' + designationName + '</td>' +
                        // '<td class="fund-name-custom" style="display:none">' + designationOther + '</td>' +
                        '<td class="fund-amount-formatted"><div class="input-group mb-2">' +
                        '<div class="input-group-prepend"><div class="input-group-text">$</div></div>' +
                        '<input type="text" class="form-control required" placeholder="0.00" value="' +
                        designationAmountFormatted +
                        '" onkeyup="updateCartAmount(this)" />' +
                        '</div></td>' +
                        '<td class="fund-amount" style="display:none;"><input type="text" value="' +
                        designationAmount +
                        '" /></td>' +
                        '<td class="fund-delete"><a href="" class="remove-item"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#e00122" d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"></path></svg></a></td>' +
                        '</tr>'
                    );

                    // update cart total
                    BBI.Methods.updateCartTotal();

                    // reset ALL fields
                    $('#otherAmtInput').val('');
                    // $('#txtGiftAmount').val('0.00');

                    // $('#areaSupportSelect').val('');

                    // var areaToSupportSelect = document.getElementById("areaSupportSelect"),
                    //     collegeUnitSelect = document.getElementById("collegeUnitSelect"),
                    //     fundSelect = document.getElementById("fundSelect");
                        
                    // areaToSupportSelect.setAttribute("selectedIndex", 0);
                    // collegeUnitSelect.setAttribute("selectedIndex", 0);
                    // fundSelect.setAttribute("selectedIndex", 0);

                    // const selectElement = setSelectedIndex(document.getElementById("areaSupportSelect"));
                    // setSelectedIndex(document.getElementById("collegeUnitSelect"));
                    // setSelectedIndex(document.getElementById("fundSelect"));

                    const selectAreaElement = document.getElementById("areaSupportSelect");
                    const selectCollegeElement = document.getElementById("collegeUnitSelect");
                    const selectFundElement = document.getElementById("fundSelect");

                    selectAreaElement.selectedIndex = 0;
                    selectCollegeElement.selectedIndex = 0;
                    selectFundElement.selectedIndex = 0;

                    $(".amounts .amount.selected").removeClass("selected");
                    document.getElementById("otherAmtInput").value = "";

                    $(".collegeUnitToggle, .fundToggle").css("display", "none");

                    // $('#divDesignationSubCategory').hide();
                    // $('#ddlDesignationSubCategory').val('');

                    // $('#fundToggle').hide();
                    // $('#fundSelect').val('');

                    // $('#divDesignationOther').hide();
                    // $('#txtDesignationOther').val('');

                    BBI.Methods.updateAmountValues();
                    // BBI.Methods.checkSpousePartnerVisibility();
                }
            }

            if ($('#ddlDesignationCategory').val() === '') {
                $('#ddlDesignationCategory').focus();
            } else if ($('#ddlDesignationSpecific').val() === '') {
                $('#ddlDesignationSpecific').focus();
            } else {
                $('#otherAmtInput').focus();
            }
        },

        // Day of Giving
        // Update amount values across form
        updateAmountValues: function () {
            var currentAmount = $('#otherAmtInput').val(); //txtGiftAmount
            var amount = 0.00;
            var cart = 0.00;
            var minGiftAmount = parseFloat(BBI.Defaults.minGiftAmount);
            var minInstallmentAmount = parseFloat(BBI.Defaults.minInstallmentAmount);
            var today = ServerDate;
            var todayText = BBI.Methods.nth(serverDay);

            // update total amount
            if ($('#tblCartTable tbody').children().length === 0) {
                amount = parseFloat(currentAmount);

                if (amount < minGiftAmount && amount > 0.00) {
                $('#txtGiftAmountFormatted_MinAmount').html('The minimum donation amount is $' + minGiftAmount.toFixed(2) + '.')
                $('#txtGiftAmountFormatted_MinAmount').show();
                $('#spanCartTotalAmount_MinAmount').hide();
                $('.cart-total').removeClass('required-message');
                } else {
                $('#txtGiftAmountFormatted_MinAmount').hide();
                }

            } else {
                $('.fund-amount input').each(function () {
                    amount += +parseFloat(parseFloat($(this).val()).toFixed(2));
                });
                amount = parseFloat(amount);
                $("#spanCartTotalAmount").text(numberWithCommas(amount.toFixed(2)));

                if (amount < minGiftAmount && amount > 0) {
                $('#spanCartTotalAmount_MinAmount').html('The minimum donation amount is $' + minGiftAmount.toFixed(2))
                $('#spanCartTotalAmount_MinAmount').show();
                $('.cart-total').addClass('required-message');
                $('#txtGiftAmountFormatted_MinAmount').hide();
                } else {
                $('#spanCartTotalAmount_MinAmount').hide();
                $('.cart-total').removeClass('required-message');
                }
            }

            var type = $("#giftTypeSelect option:selected").val();
            // 0 = one time gift, 1 = recurring gift, 2 = new pledge, 3 = payment on existing pledge

            if (type === "0") { // one time gift

            }

            if (type === "Monthly") { // recurring gift
                // 0 = No end date, 1 = 1 year only
                var duration = 0; //WPADF.Defaults.RecurringGiftEndOption;
                var frequency = $("#ddlRecurringFrequency option:selected").val();
                var payments = duration * frequency;
                // 1 = monthly, 3 = quarterly, 12 = yearly
                var paymentsPerYear = 0;
                var frequencyLabel = "";

                switch (frequency) {
                case "1":
                    paymentsPerYear = 12;
                    frequencyLabel = "1 month";
                    break;
                case "3":
                    paymentsPerYear = 4;
                    frequencyLabel = "3 months";
                    break;
                case "12":
                    paymentsPerYear = 1;
                    frequencyLabel = "12 months";
                }

                var recurringText = "Your first payment will be charged by the end of the next business day. Scheduled installments will be automatically charged to your credit card on or about the " + todayText + " according to the payment schedule selected.";

                $("#lblRecurringText").text(recurringText);

                if (duration > 0) {
                var recurringGiftAmountPerYear = numberWithCommas(parseFloat(amount * paymentsPerYear * duration).toFixed(2));
                var recurringGiftPaymentAmount = numberWithCommas(parseFloat(amount).toFixed(2));

                if (parseFloat(amount) < minInstallmentAmount) {
                    $('#tdRecurringPerPayment_MinAmount').html('The minimum installment amount is $' + minInstallmentAmount.toFixed(2))
                    $('#tdRecurringPerPayment_MinAmount').show();
                    $('#tdRecurringDefinedPerPayment').addClass('required-message');
                } else {
                    $('#tdRecurringPerPayment_MinAmount').hide();
                    $('#tdRecurringDefinedPerPayment').removeClass('required-message');
                }

                $('#lblRecurringFrequencyCalculation').text("(That's $" + recurringGiftAmountPerYear + " per year)");

                $("#tdRecurringDefinedPayments").html(paymentsPerYear * duration);
                $("#tdRecurringDefinedPerPayment").html('$' + recurringGiftPaymentAmount);
                $("#tdRecurringDefinedFrequency").html(frequencyLabel);
                $("#tdRecurringDefinedTotal").html("$" + numberWithCommas((amount * paymentsPerYear * duration).toFixed(2)));
                } else {
                var total = 0;
                var amountPerYear = "";
                amountPerYear = numberWithCommas(parseFloat(amount * paymentsPerYear).toFixed(2));

                $('#lblRecurringFrequencyCalculation').text("(That's $" + amountPerYear + " per year)");

                $("#tdRecurringNeverEndingPerPayment").html("$" + numberWithCommas(amount.toFixed(2)));
                $("#tdRecurringNeverEndingFrequency").html(frequency + " months");
                }          

            }

            if (type === "Pledge") { // new pledge
                var pledgeIsMonths = false;
                var pledgeDuration = $("#ddlPledgeDuration option:selected").val();
                var pledgeFrequency = parseInt($("#ddlPledgeFrequency option:selected").val());

                if (pledgeDuration.indexOf("months") !== -1) {
                    pledgeIsMonths = true;
                    pledgeDuration = parseInt(pledgeDuration.replace(" months", ""));

                    if (pledgeDuration < 4 && pledgeFrequency !== 12) {
                        $("#ddlPledgeFrequency").val("12");
                        pledgeFrequency = 12;
                    }

                } else {
                    pledgeDuration = parseInt(pledgeDuration);
                }

                var pledgePayments = 0;
                if (!pledgeIsMonths) {
                    pledgePayments = pledgeDuration * pledgeFrequency;
                    } else {
                    if (pledgeFrequency == 12) {
                        pledgePayments = pledgeDuration;
                    } else if (pledgeFrequency == 4) {
                        if (pledgeDuration < 3) {
                            pledgePayments = 1;
                        } else {
                            pledgePayments = Math.ceil(pledgeDuration / 3);
                        }
                        
                    }
                }
                
                var pledgeFrequencyLabel = "";

                switch (pledgeFrequency) {
                case 12:
                    pledgeFrequencyLabel = "1 month";
                    break;
                case 4:
                    pledgeFrequencyLabel = "3 months";
                    break;
                case 1:
                    pledgeFrequencyLabel = "12 months";
                }

                var pledgeText = "Your first payment will be charged by the end of the next business day. Scheduled installments will be automatically charged to your credit card on or about the " + todayText + " according to the payment schedule selected.";

                $("#lblPledgeText").text(pledgeText);

                var pledgeAmountPerYear = (0).toFixed(2);
                if (!pledgeIsMonths) {
                    pledgeAmountPerYear = numberWithCommas(parseFloat(amount / pledgeDuration).toFixed(2));
                } else {
                    pledgeAmountPerYear = numberWithCommas(parseFloat(amount).toFixed(2));
                }
                
                var pledgePaymentAmount = numberWithCommas(parseFloat(amount / pledgePayments).toFixed(2));

                if (parseFloat(amount / pledgePayments) < minInstallmentAmount) {
                    $('#tdPledgePerPayment_MinAmount').html('The minimum installment amount is $' + minInstallmentAmount.toFixed(2))
                    $('#tdPledgePerPayment_MinAmount').show();
                    $('#tdPledgePerPayment').addClass('required-message');
                } else {
                    $('#tdPledgePerPayment_MinAmount').hide();
                    $('#tdPledgePerPayment').removeClass('required-message');
                }


                $('#lblPledgeDurationCalculation').text("(That's $" + pledgeAmountPerYear + " per year)");

                $("#tdPledgePayments").html(pledgePayments);
                $("#tdPledgePerPayment").html('$' + pledgePaymentAmount);
                $("#tdPledgeFrequency").html(pledgeFrequencyLabel);
                $("#tdPledgeTotal").html("$" + numberWithCommas(amount.toFixed(2)));

            }

            if (type === "3") { // payment on existing pledge

            }

            var getMonthsBetweenDates = function (dateValue) {
                var date1 = ServerDate;
                var date2 = new Date(dateValue);
                var year1 = date1.getFullYear();
                var year2 = date2.getFullYear();
                var month1 = date1.getMonth();
                var month2 = date2.getMonth();
                if (month1 === 0) { //Have to take into account
                    month1++;
                    month2++;
                }
                var numberOfMonths = (year2 - year1) * 12 + (month2 - month1) + 1;

                return numberOfMonths;
            }

        },

        installmentUpdate: function() {
            var cartTotal = $("#totalGift"),
                numberOfInstallments = $("#numberOfInstallments").val(),
                total = 0,
                newTotal,
                formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                });

            $('.line-item .line-item-amount input').each(function() {
                var amount = Number($(this).val());
                // console.log(amount);
                total += +parseFloat(amount, 10).toFixed(2);
            }).promise().done(function() {
                newTotal = parseFloat(total, 10).toFixed(2);
                cartTotal.val(formatter.format(newTotal));
            });
        
            if(numberOfInstallments > 0) {
            // console.log(numberOfInstallments);
                var n1 = $("#totalGift").val(),
                    n2 = $("#numberOfInstallments").val(),
                    regp = /[^0-9.-]+/g,
                    formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                    });
            
                var installmentAmount = parseFloat(n1.replace(regp, '')) / parseFloat(n2.replace(regp, ''));
                installmentAmount = parseFloat(installmentAmount, 10).toFixed(2);
                $("#installmentAmount").val(formatter.format(installmentAmount));
            }

        },

        // Day of Giving
        // Total all gifts
        updateCartTotal: function () {
            // cache cart variables
            var activeGiftTotal = $('#otherAmtInput').val(); // txtGiftAmount
            var cartItems = $('.fund-amount').length;
            var cartTotal = $('.cart-total .cart-total-amount');
            var total = activeGiftTotal;

            // update number of items in cart
            $('.cart-title span').text(cartItems);

            var cartIsEmpty = $('#tblCartTable tbody').children().length === 0;

            // update total amount
            if (cartIsEmpty) {
                cartTotal.text(parseFloat(total).toFixed(2));
            } else {
                $('.fund-amount input').each(function () {
                    total += +parseFloat($(this).val()).toFixed(2);
                }).promise().done(function () {
                    cartTotal.text(parseFloat(total).toFixed(2));
                });
            }

            // toggle gift list
            if (cartIsEmpty) {
                $('#divShoppingCart').hide();
                $('.cart-total .cart-total-amount').text('0.00');
            } else {
                $('#divShoppingCart').show();
            }

            BBI.Methods.updateAmountValues();
        },

        // Day of Giving
        // Add appropriate number suffix (10th, 1st, etc.)
        nth: function (d) {
            var suffix = "";

            switch (d % 10) {
                case 1:
                suffix = "st";
                break;
                case 2:
                suffix = "nd";
                break;
                case 3:
                suffix = "rd";
                break;
                default:
                suffix = "th";
            }

            switch (d) {
                case 11:
                case 12:
                case 13:
                suffix = "th"
                break;
            }

            return (d + suffix);
        },

        // Day of Giving
        // remove from cart
        removeFromCart: function () {
            $('#tblCartTable').on('click', '.remove-item', function (e) {
                // prevent default action
                e.preventDefault();

                // remove row from cart table
                $(this).closest('tr').remove();

                if ($('#tblCartTable tbody').children().length === 0) {
                    $('#divIWantToSupport').show();
                    $('#divAddGiftButton').hide();
                    $("#divAddAnotherGiftButton").show();
                }

                // update cart total again
                BBI.Methods.updateCartTotal();
                // BBI.Methods.checkSpousePartnerVisibility();
            });
        },

        addAnotherGift: function() {
            //  add-another-gift
            var anotherGiftButton = document.querySelector(".add-another-gift");
            var notanotherGiftButton = document.querySelector(".not-another-gift");

            anotherGiftButton.addEventListener("click", function(e) {
                e.preventDefault();
                $(".amountsToggle, .giftDetailsToggle, .fund-list").slideDown();
                $("#divAddAnotherGiftButton").slideUp();
            });

            notanotherGiftButton.addEventListener("click", function(e) {
                e.preventDefault();
                // $(".amountsToggle, .giftDetailsToggle, .fund-list").slideDown();
                $("#divAddAnotherGiftButton").slideUp();
            });
        },

        // remove fund
        removeFund: function(id) {
            // remove card
            if (!!id) {
                $('.fund-card[data-id="' + id + '"]').remove();
            }

            // no funds
            if ($('.fund-card').not('.empty, .proc-fee').length === 0) {
                $('.fund-card.empty').removeClass('hidden');
            }

            // update total amount
            BBI.Methods.updateTotal();

            BBI.Methods.totalAmountChange();

            // update pledge summary
            if ($('#pledgeGift').is(':checked')) {
                // BBI.Methods.pledgeSummary();
            }
        },

        // update total
        updateTotal: function() {
            // cart variables
            var cartTotal = $('.total-amount span'),
                total = 0,
                newTotal,
                formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                });

            // update processing fee
            // if ($('#processingFee').is(':checked')) {
            //     BBI.Methods.updateProcessingFee();
            // } else {
            //     $('.fund-card.proc-fee input').val('');
            // }

            // update total amount
            $('.fund-card input').each(function() {
                var amount = Number($(this).val());
                total += +parseFloat(amount, 10).toFixed(2);
            }).promise().done(function() {
                newTotal = parseFloat(total, 10).toFixed(2);
                cartTotal.text(formatter.format(newTotal));
            });
        },

        // matching gift search
        matchingGiftSearch: function() {
            // field variables
            var companySearch = $('#matchingGiftName'),
                searchResults = $('#matchingGiftSearchResults');

            // api variables
            var x2js = new X2JS(),
                key = BBI.Defaults.hepKey;

            // clear results
            function clearResults() {
                searchResults.find('ol').html('');
                $('.no-results').remove();
            }

            // currency formatting
            function formatCurrency(currencyString) {
                return parseFloat(currencyString).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                });
            }

            // search button keypress event (enter key)
            companySearch.on('keypress', function(e) {
                if ($(this).val() !== '' && $(this).is(':focus') && e.which === 13) {
                    e.preventDefault();
                    $('.hep-search').click();
                }
            });

            // search button click event
            $('.hep-search').on('click', function(e) {
                // prevent default action
                e.preventDefault();

                // clear results
                clearResults();

                // loading indicator
                searchResults.append('<p class="loading"><small>Loading...</small></p>');

                // search input value
                var searchValue = companySearch.val();

                // get companies
                $.get('https://automatch.matchinggifts.com/name_searches/xml/' + key + '/' + searchValue, function() {
                    // nothing to see here...
                }).done(function(data) {
                    // remove loading indicator
                    $('.loading').remove();

                    // data variables
                    var dataObj = x2js.xml2json(data),
                        count = dataObj.companies.count,
                        companies = dataObj.companies.company;

                    if (!!companies) {
                        // loop through companies
                        $(companies).each(function(i, v) {
                            // company variables
                            var companyId = v.company_id,
                                name = v.name;

                            searchResults.find('ol').append('<li><a href="#companyDetails" class="company" href="#" data-company-id="' + companyId + '" data-company-name="' + name + '">' + name + '</a></li>');
                        });
                    } else {
                        // no companies found
                        searchResults.append('<p class="no-results"><small>Sorry, "' + searchValue + '" was not found. Please check the spelling and re-submit.</small></p>');
                    }
                }).fail(function(errorThrown) {
                    console.log(errorThrown);
                }).always(function() {
                    // company link click event
                    $('.company').on('click', function() {
                        // company id (data attribute)
                        var companyId = $(this).data('company-id');

                        // company name (data attribute)
                        var companyName = $(this).data('company-name');

                        // get company details
                        $.get('https://automatch.matchinggifts.com/profiles/xml/' + key + '/' + companyId, function() {
                            // nothing to see here...
                        }).done(function(data) {
                            // data variables
                            var dataObj = x2js.xml2json(data),
                                company = dataObj.company,
                                subsidiaryOf = company.name,
                                companyId = company.company_id,
                                lastUpdated = company.last_updated,
                                contact = company.contact,
                                phone = company.contact_phone,
                                email = company.contact_email,
                                giftFormURL = company.online_resources.online_resource.matching_gift_form,
                                guide = company.online_resources.online_resource.guide,
                                minMatch = company.giftratios.minimum_amount_matched,
                                maxMatch = company.giftratios.maximum_amount_matched,
                                totalPerEmployee = company.giftratios.total_amount_per_employee,
                                giftRatio = company.giftratios.giftratio,
                                comments = company.comments,
                                procedure = Object.keys(company.procedure).map(function(i) {
                                    return company.procedure[i];
                                }).filter(Boolean),
                                companyDetails = $('<div><a href="#_" class="close"><span class="fas fa-fw fa-times"></span></a><strong>Company:</strong> ' + companyName + '<br><strong>Subsidiary of:</strong> ' + subsidiaryOf + '<br><strong>Foundation #:</strong> ' + companyId + '<br><strong>Last Updated:</strong> ' + lastUpdated + '<br><strong>Contact:</strong> ' + contact + '<br><strong>Phone:</strong> <a href="tel:' + phone + '">' + phone + '</a><br><strong>E-Mail:</strong> <a href="mailto:' + email + '">' + email + '</a><br><strong>Matching Gift Form URL:</strong> <a href="' + giftFormURL + '" target="_blank">' + giftFormURL + '</a><br><strong>Matching Gift Guidelines URL:</strong> <a href="' + guide + '" target="_blank">' + guide + '</a><br><strong>Minimum amount matched:</strong> ' + formatCurrency(minMatch) + '<br><strong>Maximum amount matched:</strong> ' + formatCurrency(maxMatch) + '<br><strong>Total per employee:</strong> ' + formatCurrency(totalPerEmployee) + '<br><strong>Gift ratio:</strong> ' + giftRatio + '<br><br><strong>Comments:</strong> ' + comments + '<br><br><strong>Procedure:</strong><br><ul><li>' + procedure.join('</li><li>') + '</li></ul><br><p><a href="#_" class="button select-company" data-select="' + companyName + '">Select Company</a><a href="#_" class="button return-to-list">Return to List</a></p></div>');

                            // reset company details
                            $('#companyDetails').html('');
                            companyDetails.appendTo('#companyDetails');

                            // select company click event
                            $('.select-company').on('click', function() {
                                // populate field value
                                companySearch.val($(this).data('select'));

                                // clear results
                                clearResults();
                            });
                        }).fail(function(errorThrown) {
                            console.log(errorThrown);
                        });
                    });
                });
            });
        },

        hideQueryLoader: function() {
            $("#queryLoader").slideUp();
            $(".fundSelect").slideDown();
            // $(".fund-list").slideDown();
        },

        // validation markers
        validationMarkers: function() {
            $('<span class="marker"></span>').insertBefore('.required');
        },

        footerBgScript: function() {

            function getRndInteger(min, max) {
                var value = Math.floor(Math.random() * (3 - 0)) + 0;
                switch (value) {
                    case 0:
                        document.getElementById("footer").style.backgroundPosition = "center top";
                        break;
                    case 1:
                        document.getElementById("footer").style.backgroundPosition = "center center";
                        break;
                    case 2:
                        document.getElementById("footer").style.backgroundPosition = "center bottom";
                        break;
                    default:
                        document.getElementById("footer").style.backgroundPosition = "center center";
                }
                return value;
            }

            getRndInteger(0, 3);

        },

        createMenuSVG: function() {
            $('.alumni #mainMenu .mainMenu .nccUlMenuSub2').each(function() {
                var height = $(this).height();
                var width = Math.floor(height / 10);
                $(this).append('<svg viewbox="0 0 ' + width + ' ' + height + '" height="' + height + '" width="' + width + '" style="position:absolute; top: 0; right: -' + (width - 1) + 'px" ><polygon points="0,0 0,' + height + ' ' + width + ',0" style="fill:#de1c24;" /></svg>');
            });
        },

        initAccordions: function() {
            if ($('table.accordionTable').length > 0) {
                $('table.accordionTable').each(function() {
                    $(this).replaceWith($(this).html()
                        .replace(/<tbody/gi, "<div class='accordionWrapper'")
                        .replace(/<td/gi, "<div")
                        .replace(/<\/td>/gi, "</div>")
                        .replace(/<\/tbody/gi, "<\/div")
                    );
                });
                $('.accordionWrapper').each(function() {
                    $(this).find('.headerRow').on('click', function() {
                        $(this).parent().find('.contentRow').slideToggle(300);
                        $(this).parent().find('.headerRow').toggleClass('active');
                    });
                });
            }
        },

        subNavScroll: function() {
            // Scroll to section
            $(".nav-list > li > a:not(:first-child)").click(function(e) {
                // Prevent a page reload when a link is pressed
                e.preventDefault();

                $("html, body").animate({
                    scrollTop: $($(this).attr("href")).offset().top - 80
                }, 800);
                return false;
            });
        },

        coerStyles: function() {
            if ($('#status-table').length !== 0) {
                $('#status-table').addClass('clearfix');
                $('span[id*="rptAttendeesDetails"]').not('[style], [id*="udpAttendees"]').parent('td, div.cell').addClass('labelTd');
                $('[id*="udpAttendees"]').parent('td, div.cell').addClass('mainTd');
                if ($('.mainTd').length > 1) {
                    $('.mainTd').css('width', '50%');
                    $('.mainTd').last().css('border-left', '1px solid #CCC').css('padding-left', '10px');
                    $('#divWizardButtons').css('max-width', '100%');
                }
            }
        },

        donationAmount: function() {
            var amountValue = BLACKBAUD.api.querystring.getQueryStringValue('amount');
            if (amountValue.length !== 0 && $('.DonationFormTable input[id$="txtAmount"]').length !== 0) {
                $('.DonationFormTable input[id$="txtAmount"]').val(amountValue);
            } else if (amountValue.length !== 0 && $('#advancedDonationForm input[id$="txtAmount"]').length !== 0) {
                $('.DonationFormTable input[id$="txtAmount"]').val(amountValue);
                $('.amountButton .selected').removeClass('selected');
                $('#adfOtherLabel').hide();
                $('#txtAmount').show().val(amountValue);
                $('.adfTotalAmount span').text(amountValue);
            }
        },

        foundationMediaOverlay: function() {
            // set the backgroundimage to show,
            // since the following code will hide if need be
            //$('.wrapBreadcrumbs p img').show();



            if ($('#internalPage .mediaBoxOverlay').length !== 0) {
                var parentDiv = $('.mediaBoxOverlay').closest('.container');
                if ($(window).width() > 768) {
                    // $('.mediaBoxOverlay').css('height', $('.mediaBoxOverlay').parent().height() - 30);
                }
                parentDiv.append('<i class="mediaBoxToggle">');
                $('.mediaBoxToggle').on('click', function() {

                    $('.mediaBoxOverlay').toggle({
                        effect: "scale",
                        direction: "both",
                        origin: ["bottom", "right"]
                    });
                    $(this).toggleClass('expanded');
                });
            } else if ($('#internalPage.alumni .wrapBreadcrumbs p img').length !== 0) {
                var backgroundImage = $('.wrapBreadcrumbs p img');
                var backgroundImageURL = backgroundImage.attr('src');
                $('.fullWidthBackgroundImage').css({
                    'background-image': 'url(' + backgroundImageURL + ')',
                    'background-position': 'center top'
                });
                backgroundImage.closest('p').hide();
            } else if ($('#homePage .mediaBoxOverlay').length !== 0) {
                var backgroundImage = $('.wrapBreadcrumbs p img');
                var backgroundImageURL = backgroundImage.attr('src');
                $('.fullWidthBackgroundImage').css({
                    'background-image': 'url(' + backgroundImageURL + ')',
                    'background-position': 'center top'
                });
                backgroundImage.closest('p').hide();
            }

            if ($('.utilityMenus .offcanvasReg').length !== 0) {
                if ($('.utilityMenus a[id*="lbtnRegisterUser"]').length !== 0) {
                    $('.utilityMenus a[id*="lbtnRegisterUser"]').after($('.utilityMenus .offcanvasReg'));
                }

                $('.utilityMenus table[id*="tbl"]').wrap('<div class="animatedReveal">');
                $('.utilityMenus li.login a').on('click', function() {
                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                        $('.utilityMenus table[id*="tbl"]').hide('blind', 'slow');
                    } else {
                        $(this).addClass('active');
                        $('.utilityMenus table[id*="tbl"]').show('blind', 'slow');
                    }
                });
            }
        },

        // date picker behavior
        datePicker: function() {
            // today's date
            var date = new Date(),
                today = date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                }).replace(/\u200E/g, '');

            if ($('html').hasClass('-ms-')) {
                // $('#startDate').val(today);
                $('#pledgeStartDate').val(today);
            } else {
                // $('#startDate').val(new Date(today).toISOString().substring(0, 10));
                $('#pledgeStartDate').val(new Date(today).toISOString().substring(0, 10));
            }

            // normalized date attribute
            // $('#startDate').attr('data-date', today);
            $('#pledgeStartDate').attr('data-date', today);

            if ($("#startDate").length !== 0) {
                var d = new Date(),
                    day = d.getDate();

                function getMinDate() {
                    var date = new Date();
                    if (day > 15) {
                        date.setMonth(date.getMonth() + 1, 1);
                    } else if (day == 1) {
                        // set to current date
                    } else {
                        date.setDate(15);
                    }
                    return date;
                }
                $("#startDate").datepicker({
                    beforeShowDay: function(dt) {
                        return [
                            dt.getDate() == 1 || dt.getDate() == 15 ?
                            true :
                            false,
                        ];
                    },
                    minDate: getMinDate(),
                });
                $("#startDate").datepicker("setDate", getMinDate()).attr('data-date', getMinDate());

                if ($("#startDate").hasClass("month-year")) {
                    // console.log("payroll deduction!");
                } else {
                    // console.log("advanced donation form!");
                    $("#ui-datepicker-div").addClass("show-calendar");
                }

                $("#endDate").datepicker({
                    minDate: getMinDate()
                });
            }

            if ($("#startMonth").length !== 0) {
                var d = new Date(),
                    day = d.getDate();

                function getMinDate() {
                    var date = new Date();

                    date.setMonth(date.getMonth() + 1, 1);
                    /*
                      if (day > 15) {
                          date.setMonth(date.getMonth() + 1, 1);
                      } else if (day == 1) {
                          // set to current date
                      } else {
                          date.setDate(15);
                    } */
                    return date;
                }

                $("#startMonth").datepicker({
                    changeMonth: true,
                    changeYear: true,
                    showButtonPanel: true,
                    dateFormat: 'MM yy',
                    onClose: function(dateText, inst) {
                        $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                    },
                    minDate: getMinDate(),
                });

                $("#startMonth").datepicker("setDate", getMinDate()).attr('data-date', getMinDate());
            }

        },

        // calculate installments
        calculateInstallments: function() {
            // run on all field events
            $('#numberOfInstallments').add('#pledgeFrequency').add('#pledgeStartDate').on('change keyup focusout input paste', function() {
                // BBI.Methods.pledgeSummary();
            });
        },

        // Gift Amounts
        giftAmounts: function() {
            console.log("gift amounts!");
            $(".amounts a, .amounts .otherAmt").on("click", function(e) {
                e.preventDefault();
                $(".amounts a, .amounts .otherAmt, .amounts input").removeClass("selected");
                $(this).addClass("selected");

                // if it's 'other', add 'selected' class to input and give that input focus
                if ($(this).hasClass("otherAmt")) {
                    $(this).find("> input").addClass("selected").focus().select();
                    // $("#otherAmtInstr").show();
                    // $(".validation-message").hide();
                } else {
                    var newVal = parseFloat($(this).attr("data-value"), 10).toFixed(2);
        
                    $(".amounts #otherAmtInput").val(newVal);
                    // $("#otherAmtInstr").hide();
                    var resetNumberOfInstallments = 1;
                    $("#numberOfInstallments").val(resetNumberOfInstallments);

                    BBI.Methods.totalAmountChange();
                }
            });

            $("input[data-type='currency']").on({
                keyup: function () {
                    formatAmountCurrency($(this));
                },
                blur: function () {
                    formatAmountCurrency($(this), "blur");
                }
            });

            function formatNumber(n) {
                // format number 1000000 to 1,234,567
                return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }

            function formatAmountCurrency(input, blur) {
                // validates decimal side and puts cursor back in right position.

                // get input value
                var input_val = input.val();

                // don't validate empty input
                if (input_val === "") {
                    return;
                }

                // original length
                var original_len = input_val.length;

                // initial caret position
                var caret_pos = input.prop("selectionStart");

                // check for decimal
                if (input_val.indexOf(".") >= 0) {
                    // get position of first decimal
                    // this prevents multiple decimals from
                    // being entered
                    var decimal_pos = input_val.indexOf(".");

                    // split number by decimal point
                    var left_side = input_val.substring(0, decimal_pos);
                    var right_side = input_val.substring(decimal_pos);

                    // add commas to left side of number
                    left_side = formatNumber(left_side);

                    // validate right side
                    right_side = formatNumber(right_side);

                    // On blur make sure 2 numbers after decimal
                    if (blur === "blur") {
                        right_side += "00";
                    }

                    // Limit decimal to only 2 digits
                    right_side = right_side.substring(0, 2);

                    // join number by .
                    input_val = left_side + "." + right_side;
                } else {
                    // no decimal entered
                    // add commas to number
                    // remove all non-digits
                    input_val = formatNumber(input_val);
                    input_val = input_val;

                    // final formatting
                    if (blur === "blur") {
                        input_val += ".00";
                    }
                }

                // send updated string to input
                input.val(input_val);

                // put caret back in the right position
                var updated_len = input_val.length;
                caret_pos = updated_len - original_len + caret_pos;
                input[0].setSelectionRange(caret_pos, caret_pos);
            }
        },

        // URL query parameters
        queryParameters: function() {
            // if finder number is in URL (core BBIS functionality)
            if (!!BBI.Methods.returnQueryValueByName('efndnum')) {
                let finderNumber = BBI.Methods.returnQueryValueByName('efndnum');
                $("#finderNumber").val(finderNumber);
            }

            // character counter (comments)
            // if ($('#comments').length !== 0) {
            //     $('#comments').limit('#comments + .char-counter span');
            // }

            const capitalize = (s) => {
                if (typeof s !== 'string') return ''
                return s.charAt(0).toUpperCase() + s.slice(1)
            }

            if (!!BBI.Methods.returnQueryValueByName('fname')) {
                $('#personalFirstName').val(capitalize(BBI.Methods.returnQueryValueByName('fname')));
            }

            if (!!BBI.Methods.returnQueryValueByName('lname')) {
                $('#personalLastName').val(capitalize(BBI.Methods.returnQueryValueByName('lname')));
            }

            if (!!BBI.Methods.returnQueryValueByName('adr')) {
                $('#personalAddress').val(BBI.Methods.returnQueryValueByName('adr'));
            }

            if (!!BBI.Methods.returnQueryValueByName('adrtp')) {
                $('#personalAddressType option:selected').text(capitalize(BBI.Methods.returnQueryValueByName('adrtp')));
            }

            if (!!BBI.Methods.returnQueryValueByName('cty')) {
                $('#personalCity').val(capitalize(BBI.Methods.returnQueryValueByName('cty')));
            }

            if (!!BBI.Methods.returnQueryValueByName('st')) {
                $('#personalState').val(BBI.Methods.returnQueryValueByName('st').toUpperCase());
            }

            if (!!BBI.Methods.returnQueryValueByName('zp')) {
                $('#personalZip').val(BBI.Methods.returnQueryValueByName('zp'));
            }

            if (!!BBI.Methods.returnQueryValueByName('eml')) {
                $('#personalEmail').val(BBI.Methods.returnQueryValueByName('eml'));
            }

            if (!!BBI.Methods.returnQueryValueByName('emltp')) {
                $('#personalEmailType option:selected').text(capitalize(BBI.Methods.returnQueryValueByName('emltp')));
            }

            // if finder number is in URL (core BBIS functionality)
            // if (!!BBI.Methods.returnQueryValueByName('solicitor')) {
            //     $('#solicitorCode').val(BBI.Methods.returnQueryValueByName('solicitor'));
            // }
        },

        // pledge summary
        pledgeSummary: function() {
            // pledge installment helper function variables
            // var totalGiftAmount = $('.total-amount span').text().replace('$', '').replace(',', ''),
            // 	numberOfInstallments = $('#pledgeInstallments').val(),
            // 	frequencyCode = "2",
            // 	// frequencyCode = $('#pledgeFrequency').val(),
            // 	installmentStartDate = new Date($('#pledgeStartDate').attr('data-date')),
            // 	installmentDayOfMonth = installmentStartDate.getDate(),
            // 	installmentMonth = installmentStartDate.getMonth() + 1;

            // // pledge summary logic
            // if ($('.fund-card.empty').hasClass('hidden') && $('#pledgeFrequency').val() !== '-1' && $('#pledgeInstallments').val() !== '' && $('.min-amount').length === 0) {
            // 	// payment info variables
            // 	var pledgeInstallmentValue = $('#pledgeInstallments').val();
            // 	if (pledgeInstallmentValue == '1') {

            // 		var GiftLastPaymentDate = $('#pledgeStartDate').attr('data-date'),
            // 			GiftInstallmentAmount = donationService.getRecurringGiftInstallmentAmount(totalGiftAmount, numberOfInstallments);

            // 	} else {

            // 		var GiftLastPaymentDate = donationService.getRecurringGiftLastPaymentDate(numberOfInstallments, frequencyCode, installmentStartDate, installmentMonth, installmentDayOfMonth).toLocaleDateString('en-US', {
            // 			month: '2-digit',
            // 			day: '2-digit',
            // 			year: 'numeric'
            // 		}),
            // 			GiftInstallmentAmount = donationService.getRecurringGiftInstallmentAmount(totalGiftAmount, numberOfInstallments);

            // 	}
            // 	// convert currency format
            // 	var formatter = new Intl.NumberFormat('en-US', {
            // 		style: 'currency',
            // 		currency: 'USD',
            // 	}),
            // 		formattedInstallmentAmount = formatter.format(GiftInstallmentAmount);

            // 	// pledge summary content variable
            // 	if (pledgeInstallmentValue == '1') {
            // 		$('#pledgeEndDate').val(installmentStartDate);

            // 		var pledgeSummary = numberOfInstallments + ' installments of <span class="installment-amount">' + formattedInstallmentAmount + '</span> ' + $('#pledgeFrequency option:selected').text().toLowerCase() + 'on ' + $('#pledgeStartDate').val();
            // 	} else {
            // 		var pledgeSummary = numberOfInstallments + ' installments of <span class="installment-amount">' + formattedInstallmentAmount + '</span> ' + $('#pledgeFrequency option:selected').text().toLowerCase() + 'until ' + GiftLastPaymentDate;
            // 	}
            // 	// var pledgeSummary = numberOfInstallments + ' installments of <span class="installment-amount">' + formattedInstallmentAmount + '</span> ' + $('#pledgeFrequency option:selected').text().toLowerCase() + 'until ' + GiftLastPaymentDate;

            // 	// set pledge installment end date
            // 	if ($('html').hasClass('-ms-')) {
            // 		$('#pledgeEndDate').val(GiftLastPaymentDate);
            // 	} else {
            // 		if (pledgeInstallmentValue == '1') {
            // 			$('#pledgeEndDate').val($('#pledgeStartDate').val());
            // 		} else {
            // 			$('#pledgeEndDate').val(new Date(GiftLastPaymentDate).toISOString().substring(0, 10));
            // 		}

            // 		// $('#pledgeEndDate').val(new Date(GiftLastPaymentDate).toISOString().substring(0, 10));
            // 	}

            // 	// show pledge summary
            // 	$('#pledgeSummary').show().find('p').html(pledgeSummary);
            // } else {
            // 	// reset pledge installment end date
            // 	$('#pledgeEndDate').val('');

            // 	// hide pledge summary
            // 	$('#pledgeSummary').hide();
            // }
        },

        replaceBoxgridTables: function() {
            // Replace HTML tables with DIVs - landing page box grid elements
            if ($('.boxGridTable').length > 0) {
                $('table.boxGridTable').each(function() {
                    $(this).replaceWith($(this).html()
                        .replace(/<tbody/gi, "<div class='boxGrid'")
                        .replace(/<tr/gi, "<div class='gutter clearfix'")
                        .replace(/<td/gi, "<div")
                        .replace(/<\/th>/gi, "</div>")
                        .replace(/<\/td>/gi, "</div>")
                        .replace(/<\/tbody/gi, "<\/div")
                    );
                });
                $('.boxGrid').wrapAll('<div id="boxGridWrapper" />');
                $('#boxGridWrapper').wrapInner('<div class="gutter clearfix" />');
            }

            if ($('.boxGrid').length !== 0) {
                $('.boxGrid').hover(function() {
                    $('.boxGridCaption', this).stop().animate({
                        opacity: '0'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                    $('.boxGridReveal', this).stop().animate({
                        bottom: '0'
                    }, {
                        opacity: '1'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                }, function() {
                    $('.boxGridCaption', this).stop().animate({
                        opacity: '1'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                    $('.boxGridReveal', this).stop().animate({
                        bottom: '-100%'
                    }, {
                        opacity: '0'
                    }, {
                        duration: 300
                    }, {
                        queue: 'false'
                    });
                });
            }
        },

        menuToggles: function() {
            $('.leftCanvas .menuToggle').on('click', function(e) {
                e.preventDefault();
                $('#BodyId').toggleClass('menu-open');
                $('.leftCanvas').toggleClass('expanded');
                $('.rightCanvas').toggleClass('retracted');
                setTimeout(function() {
                    $("#mobileLogo").toggleClass('expanded');
                }, $("#mobileLogo").hasClass('expanded') ? 600 : 0);
            });
            $('.rightCanvas .menuToggle').on('click', function(e) {
                e.preventDefault();
                $('#BodyId').toggleClass('menu-open');
                $('.fa').toggleClass('fa-bars fa-close');
                $(this).toggleClass('open');
                $('.rightCanvas').toggleClass('expanded');
                $('.leftCanvas').toggleClass('retracted');
                setTimeout(function() {
                    $("#mobileLogo").toggleClass('expanded');
                }, $("#mobileLogo").hasClass('expanded') ? 600 : 0);
            });
        },

        designationSearchFormat: function() {
            if ($('span.designationInfoBoxOuter').length !== 0) {
                var desingationItems = $("span.designationInfoBoxOuter");
                for (var i = 0; i < desingationItems.length; i += 3) {
                    desingationItems.slice(i, i + 3).wrapAll("<div style='clear:both'></div>");
                }
            }
        },

        newsAndCalendarFeed: function() {
            if ($('.eventTileOuterWrapper').length !== 0) {
                $('.eventTileOuterWrapper').each(function() {
                    var eventDate = new Date($.trim($(this).find('.eventDateData').text()));
                    $(this).insertBefore($(this).closest('.BBDesignationSearchResultContainer'));
                    $(this).find('.eventTileMonth').text(BBI.Defaults.monthNames[eventDate.getMonth()]);
                    $(this).find('.eventTileDay').text(eventDate.getDate());
                    if ($.trim($(this).find('.eventUrlData').text()) !== '') {
                        $(this).find('.eventTileLink > a').attr('href', $.trim($(this).find('.eventUrlData').text()));
                    } else {
                        $(this).find('.eventTileLink').hide();
                    }

                });

                if ($('.internalLanding').length !== 0) {
                    $('.eventTileOuterWrapper').first().parent().rssfeed(BBI.Defaults.newsFeedUrl, {
                        limit: 6,
                        ssl: true,
                        snippet: false,
                        titletag: 'h3',
                        header: false
                    });
                }
            }

            if ($('.landingPage .newsTileOuterWrapper').length !== 0) {
                $('.newsTileOuterWrapper').html('').rssfeed(BBI.Defaults.newsFeedUrl, {
                    limit: 4,
                    ssl: true,
                    snippet: false,
                    titletag: 'h3',
                    header: false
                });
            }

            if ($('#homePage').not('.foundation').length !== 0) {
                $('#mainContentWrapper .primaryContent').rssfeed(BBI.Defaults.newsFeedUrl, {
                    limit: 6,
                    ssl: true,
                    snippet: false,
                    titletag: 'h3',
                    header: false
                });
            }

            if ($('.contentPaneHeader .allEventsButton').length !== 0) {
                $('.allEventsButton[data-control]').on('click', function(e) {
                    var controlSet = $(this).attr('data-control');
                    var newsItems = $('.storyTileOuterWrapper');
                    var eventItems = $('.eventTileOuterWrapper');
                    var button = $(this).not('selected');
                    e.preventDefault();

                    if (button.length !== 0) {
                        $('.contentPaneHeader .selected').removeClass('selected');
                        $(this).addClass('selected');
                        if (controlSet === 'news') {
                            newsItems.not('visible').show('slide', 'slow');
                            eventItems.not('visible').hide('slide', 'slow');
                        } else if (controlSet === 'events') {
                            eventItems.not('visible').show('slide', 'slow');
                            newsItems.not('visible').hide('slide', 'slow');
                        } else {
                            newsItems.add(eventItems).not('visible').show('slide', 'slow');
                        }
                    }
                });
            }

            if ($('.eventSlider').length !== 0) {
                $('.sliderContent').each(function() {
                    var lineItem = $('<li>');
                    $(this).find('.red a').attr('href', $(this).text()).text('Register');
                    $(this).find('.outline a').attr('href', $(this).text()).text('More Info');
                    lineItem.append($(this));
                    $('.eventSlider').append(lineItem);
                });

                $(document).ready(function() {
                    if ($(window).width() <= 768) {
                        $('.eventSlider').bxSlider({
                            minSlides: 1,
                            maxSlides: 1,
                            slideWidth: ($('#newsWrapper .inner').width()),
                            pager: true,
                            controls: false
                        });
                    } else {
                        $('.eventSlider').bxSlider({
                            minSlides: 3,
                            maxSlides: 3,
                            slideWidth: ($('#newsWrapper .inner').width() / 3) - 44,
                            slideMargin: 33,
                            pager: false
                        });
                    }
                });
            }

            $(document).ready(function() {
                if ($('.storySlider').length !== 0) {
                    if ($(window).width() <= 768) {
                        $('.storySlider').bxSlider({
                            minSlides: 1,
                            maxSlides: 1,
                            slideWidth: ($('#storiesWrapper .inner').width()),
                            controls: false
                        });
                    } else {
                        $('.storySlider').bxSlider({
                            minSlides: 1,
                            maxSlides: 1,
                            slideWidth: ($('#storiesWrapper .inner').width()),
                            pager: false
                        });
                    }
                }
            });

            if ($('.BBDesignationSearchResultContainer .foundationCalendarGridItem').length !== 0) {
                var calendarItems = $('.foundationCalendarGridItem').closest('.BBDesignationSearchResult');
                for (var i = 0; i < calendarItems.length; i += 2) {
                    calendarItems.slice(i, i + 2).wrapAll("<div class='foundationCalendarColumn'></div>");
                }
                BBI.Methods.getImagesFromFolder('Event Tile Images', BBI.Methods.foundationGridImages);
            }
        },

        getImagesFromFolder: function(folderPath, callback) {
            var jsonPath = BLACKBAUD.api.pageInformation.rootPath + 'WebApi/Images/' + folderPath;
            $.getJSON(jsonPath, function(data) {
                callback(data);
            });
        },

        foundationGridImages: function(imageArray) {
            var imagePos = 0;
            var targets = $('.foundationCalendarGridImage:visible img');
            targets.each(function() {
                $(this).attr('src', imageArray[imagePos].Url);
                imagePos++;
            });
        },

        initEventWrapper: function() {
            if ($('.eventWrapper').length !== 0) {
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                $('.eventWrapper').each(function() {
                    var dateString = $(this).find('.hiddenDataFields').text();
                    var eventDate = new Date(dateString);
                    var monthName = monthNames[eventDate.getMonth()];
                    var yearString = eventDate.getFullYear().toString().substring(2);
                    if (eventDate.getDate() === 1) {
                        $(this).find('sup').text('st');
                    } else if (eventDate.getDate() === 2) {
                        $(this).find('sup').text('nd');
                    } else if (eventDate.getDate() === 3) {
                        $(this).find('sup').text('rd');
                    }
                    $(this).find('.hiddenDataFields').hide();
                    $(this).find('.dateItem').text(eventDate.getDate());
                    $(this).find('abbr[title]').text(monthName);
                    $(this).find('.calYear').html('&rsquo;' + yearString);
                });
            }
        },

        designationSearchBoxes: function() {
            if ($('.designationInfoBox').length != 0) {
                $('.designationInfoBox').each(function() {
                    var donationLink = $(this).find('hiddenData a').attr('href');
                    var systemID = $(this).find('hiddenData').text();

                    $(this).closest('.BBDesignationSearchResult').addClass('designationInfoBoxOuter');

                    $(this).find('.designationInfoBoxGiveButton').attr('href', donationLink);
                    $(this).find('.designationInfoBoxInfoButton').attr('href', donationLink);
                });
            }
        },

        prepopulatedLinkGenerator: function() {
            if ($("div#linkGeneratorForm").length !== 0) {
                // console.log("PPL version 2!");

                // get designations for drop-down (cascading)
                // note: must be attached to a query that returns Public Name and System Record ID
                // var ucFundDesignation = $("select#ucFundSelect");
                // var ucHealthDesignation = $("select#ucHealthSelect");
                // var scholarshipsDesignation = $("select#scholarshipsSelect");
                // var collegeUnitDesignation = $("select#collegeUnitsSelect");
                // var collegeUnitFundDesignation = $("select#collegUnitsFundSelect");

                var queryService = new BLACKBAUD.api.QueryService();
                queryService.getResults(
                    BBI.Defaults.advancedDonationFormFundsQueryId,
                    function(data) {
                        // fund data
                        var allFunds = data.Rows;
                        var fundMaster = [];
                        var topLevelAll = [];
                        var typeaheadArr = [];
                        // console.log(allFunds);
                        // remove all options in main drop-down except the first
                        // $(
                        //         ucFundDesignation,
                        //         scholarshipsDesignation,
                        //         collegeUnitDesignation
                        //     )
                        //     .find("option")
                        //     .not("option:first")
                        //     .remove();
                        // get drop-down hierarchy and clean arrays
                        $.each(allFunds, function() {
                            // define values
                            var values = this.Values;
                            // var target = values[0]; // Fund name [0]
                            var target = values[1] + " (" + values[3] + ")"; // Friendly Fund Name [1]; Lookup ID [3];
                            // console.log(target);
                            var splitter = target.split("\\");
                            // remove first item in array
                            if (splitter.length > 1) {
                                splitter.shift();
                            }
                            // push values to array
                            splitter.push(values[4]); // Description [1]
                            splitter.push(values[6]); // Designation GUID [2]
                            splitter.push(values[9]); // College [3]
                            splitter.push(values[8]); // The UC Fund/Scholarships/Colleges/Unit [4]
                            fundMaster.push(splitter);
                            if (values[8] == "Colleges/Units") {
                                topLevelAll.push(values[9]);
                            }
                            // var fundNameArr = values[0];
                            var fundNameArr = values[1] + " (" + values[3] + ")"; // Friendly Fund Name [1]; Lookup ID [3];
                            var fundGuidArr = values[6];
                            typeaheadArr.push(fundNameArr);
                        });
                        var sortedFundMaster = fundMaster.sort();
                        // console.log(typeaheadArr);
                        // const arrayColumn = (arr, n) => arr.map(x => x[n]);
                        // console.log(arrayColumn(typeaheadArr, 0));
                        function multiDimensionalUnique(arr) {
                            var uniques = [];
                            var itemsFound = {};
                            for (var i = 0, l = arr.length; i < l; i++) {
                                var stringified = JSON.stringify(arr[i]);
                                if (itemsFound[stringified]) {
                                    continue;
                                }
                                uniques.push(arr[i]);
                                itemsFound[stringified] = true;
                            }
                            return uniques;
                        }
                        var fundsUnique = multiDimensionalUnique(sortedFundMaster);
                        // console.log(fundsUnique);
                        // filter unique values
                        function onlyUnique(value, index, self) {
                            return self.indexOf(value) === index;
                        }
                        var topLevelUnique = topLevelAll.filter(onlyUnique);
                        var collegeUnitsDropdown = topLevelUnique.sort();
                        // $.each(collegeUnitsDropdown, function(key, value) {
                        //     var trimmedCollege = $.trim(
                        //         value.substring(value.indexOf("-") + 1)
                        //     );
                        //     $(collegeUnitDesignation).append(
                        //         $("<option></option>")
                        //         .val(value)
                        //         .text(trimmedCollege)
                        //     );
                        // });
                        var substringMatcher = function(strs) {
                            return function findMatches(q, cb) {
                                var matches, substringRegex;
                                // an array that will be populated with substring matches
                                matches = [];
                                // regex used to determine if a string contains the substring `q`
                                substrRegex = new RegExp(q, "i");
                                // iterate through the pool of strings and for any string that
                                // contains the substring `q`, add it to the `matches` array
                                $.each(strs, function(i, str) {
                                    if (substrRegex.test(str)) {
                                        matches.push(str);
                                    }
                                });
                                cb(matches);
                            };
                        };
                        // $(".toggleOtherFund").click(function(e) {
                        // 	e.preventDefault();
                        // 	toggleAreaValid(false);
                        // 	$("#advanced-search-fund").val("");
                        // 	$(this)
                        // 		.next()
                        // 		.slideDown();
                        // });
                        $("#scrollable-dropdown-menu .typeahead").typeahead({
                            hint: false,
                            highlight: true,
                            minLength: 1,
                        }, {
                            name: "typeaheadArr",
                            limit: 100,
                            source: substringMatcher(typeaheadArr),
                        });
                        $(".typeahead").bind("typeahead:select", function(
                            ev,
                            suggestion
                        ) {
                            $("#fundName").val(suggestion);
                            //console.log(suggestion);
                            $.each(fundsUnique, function(x, subFund) {
                                // append GUID if terminal
                                if (subFund[0] === suggestion) {
                                    // console.log(subFund[2]);
                                    $("#fundGuid").val(
                                        "https://foundation.uc.edu/donate?id=" +
                                        subFund[2]
                                    );
                                    // toggleAreaValid(true);
                                }
                            });
                        });
                        $("#copyButton").click(function(e) {
                            e.preventDefault();
                            var copyText = document.getElementById("fundGuid");
                            copyText.select();
                            copyText.setSelectionRange(0, 99999);
                            document.execCommand("copy");
                            console.log(
                                "https://foundation.uc.edu/donate?id=" +
                                copyText.value
                            );
                        });
                    }
                );

            }
        },

        standardDonationScripts: function() {
            if ($("div[id*='_pnlDonationForm']").length !== 0) {
                // console.log("Standard Donation Form!");

                /*
                    1. Get Number of Rows under tbody. variable: standardDonation
                    2. Get Width of Donation Form. variable: standardDonationWidth
                    3. Subtract 1 from Number of Rows under tbody (Other amount row). variable: standardDonationAmounts
                    4. Get Gap amount total in pixels. Subtract 1 from standardDonationAmounts and multiple that number by 10. variable: standardDonationGaps
                    5. Subtract standardDonationGaps from standardDonationWidth to find amount of width each Amount can be. variable: standardDonationWidthMinusGaps
                    6. Divide Width of Donation Form by Number of Amounts.
                    7. Maintain 10px gap between inputs.
                */
                var standardDonation = document.querySelectorAll("table[id*='_tblAmount'] > tbody > tr"),
                    standardDonationWidth = $(".DonationFormTable_DonationPanel").width(),
                    standardDonationAmounts = standardDonation.length - 1,
                    standardDonationGaps = (standardDonationAmounts - 1) * 10,
                    standardDonationWidthMinusGaps = standardDonationWidth - standardDonationGaps,
                    standardDonationAmountWidth = standardDonationWidthMinusGaps / standardDonationAmounts;

                // $( "table[id*='_tblAmount'] > tbody > tr:not(:last-child)" ).each(function( index ) {
                //         $(this).width(standardDonationAmountWidth);
                // });

                function otherAmountWidth() {
                    // First function
                    function function1() {
                        $("table[id*='_tblAmount']").addClass("length length-" + standardDonationAmounts);
                        // console.log("First Function");
                    }
                    // Second function
                    function function2() {
                        var standardDonationWidthFirstAmt = $("table[id*='_tblAmount'] > tbody > tr:first-child").width();
                        $("table[id*='_tblAmount'] > tbody > tr:last-child").width(standardDonationWidthFirstAmt * 3 + 20);
                        $("table[id*='_tblAmount'] > tbody > tr:last-child > td:first-child").width(standardDonationWidthFirstAmt);
                        $("table[id*='_tblAmount'] > tbody > tr:last-child > td:last-child").width(standardDonationWidthFirstAmt * 2 + 10);
                        // console.log("Second Function");
                    }

                    let orderQueue = [];
                    // Push them in queue
                    orderQueue.push(function1);
                    orderQueue.push(function2);

                    while (orderQueue.length > 0) {
                        // Execute in order
                        orderQueue.shift()();
                    }
                    // console.log("Functions executed in queue order");
                }

                if (window.innerWidth >= 600) {
                    // otherAmountWidth();
                }

                // function myfunction(event) {
                //     console.log("Checked radio with ID = " + event.target.value);
                // }
                // document.querySelectorAll("div[id*='_pnlDonationForm'] input[name*='rdoGiftType']").forEach((input) => {
                //     input.addEventListener('change', myfunction);
                // });


                // var standardDonationWidthFirstAmt = $("table[id*='_tblAmount'] > tbody > tr:first-child").width();

                // setTimeout(function() { 
                // $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:first-child" ).width(standardDonationWidthFirstAmt);
                // $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:last-child" ).width(standardDonationWidthFirstAmt * 2 + 10);
                // }, 1000); 

                // Other Amount selected. Set focus to Other Amount text box input
                $("input[id*='_rdoOther']").on("click", function() {
                    $(".aspNetDisabled.BBFormTextbox.DonationTextboxNarrow").focus();
                });

                $("div[id*='_pnlDonationForm'] tr[id*='_trGiftType'] input[type=radio], input[id*='_chkAcknowledge'][type=checkbox]").on("click", function() {
                    console.log("frequency");
                    BBI.Methods.standardDonationFrequencyScripts();
                });

                // Prevent page from scrolling to form on load
                $(document).ready(function() {
                    $(this).scrollTop(0);
                });

            }
        },

        checkoutScripts: function() {
            if ($("div[id*='_upPayment']").length !== 0) {
                $("select[id*='PersonalInfoShippingAddress_ddTitle']").parent().addClass("titleField");
            }
        },

        standardDonationFrequencyScripts: function() {
            console.log("frequency clicked");
            setTimeout(function() {

                // var standardDonation = document.querySelectorAll("table[id*='_tblAmount'] > tbody > tr"),
                //     standardDonationWidth = $(".DonationFormTable_DonationPanel").width(),
                //     standardDonationAmounts = standardDonation.length - 1,
                //     standardDonationGaps = (standardDonationAmounts - 1) * 10,
                //     standardDonationWidthMinusGaps = standardDonationWidth - standardDonationGaps,
                //     standardDonationAmountWidth = standardDonationWidthMinusGaps / standardDonationAmounts,
                //     standardDonationWidthFirstAmt = $("table[id*='_tblAmount'] > tbody > tr:first-child").width();

                // $( "table[id*='_tblAmount'] > tbody > tr:not(:last-child)" ).each(function( index ) {
                //     $(this).width(standardDonationAmountWidth).addClass("test");
                // });

                Promise.resolve(1).then(function resolve() {
                    // $( "table[id*='_tblAmount'] > tbody > tr:not(:last-child)" ).each(function( index ) {
                    //     $(this).width(standardDonationAmountWidth).addClass("test");
                    // });

                    // $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:first-child" ).width(standardDonationWidthFirstAmt);
                    // $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:last-child" ).width(standardDonationWidthFirstAmt * 2 + 10);

                    /*
                        1. Get Number of Rows under tbody. variable: standardDonation
                        2. Get Width of Donation Form. variable: standardDonationWidth
                        3. Subtract 1 from Number of Rows under tbody (Other amount row). variable: standardDonationAmounts
                        4. Get Gap amount total in pixels. Subtract 1 from standardDonationAmounts and multiple that number by 10. variable: standardDonationGaps
                        5. Subtract standardDonationGaps from standardDonationWidth to find amount of width each Amount can be. variable: standardDonationWidthMinusGaps
                        6. Divide Width of Donation Form by Number of Amounts.
                        7. Maintain 10px gap between inputs.
                    */
                    var standardDonation = document.querySelectorAll("table[id*='_tblAmount'] > tbody > tr"),
                        standardDonationWidth = $(".DonationFormTable_DonationPanel").width(),
                        standardDonationAmounts = standardDonation.length - 1,
                        standardDonationGaps = (standardDonationAmounts - 1) * 10,
                        standardDonationWidthMinusGaps = standardDonationWidth - standardDonationGaps,
                        standardDonationAmountWidth = standardDonationWidthMinusGaps / standardDonationAmounts;

                    // $( "table[id*='_tblAmount'] > tbody > tr:not(:last-child)" ).each(function( index ) {
                    //         $(this).width(standardDonationAmountWidth);
                    // });

                    function otherAmountWidth() {
                        // First function
                        function function1() {
                            $("table[id*='_tblAmount']").addClass("length length-" + standardDonationAmounts);
                            // console.log("First Function");
                        }
                        // Second function
                        function function2() {
                            var standardDonationWidthFirstAmt = $("table[id*='_tblAmount'] > tbody > tr:first-child").width();
                            $("table[id*='_tblAmount'] > tbody > tr:last-child").width(standardDonationWidthFirstAmt * 3 + 20);
                            $("table[id*='_tblAmount'] > tbody > tr:last-child > td:first-child").width(standardDonationWidthFirstAmt);
                            $("table[id*='_tblAmount'] > tbody > tr:last-child > td:last-child").width(standardDonationWidthFirstAmt * 2 + 10);
                            // console.log("Second Function");
                        }

                        let orderQueue = [];
                        // Push them in queue
                        orderQueue.push(function1);
                        orderQueue.push(function2);

                        while (orderQueue.length > 0) {
                            // Execute in order
                            orderQueue.shift()();
                        }
                        // console.log("Functions executed in queue order");
                    }

                    if (window.innerWidth >= 600) {
                        // otherAmountWidth();
                    }
                });
                // Promise.resolve().then(() => $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:first-child" ).width(standardDonationAmountWidth));
                // Promise.resolve().then(() => $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:last-child" ).width(standardDonationAmountWidth * 2 + 10));

                // $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:first-child" ).width(standardDonationAmountWidth);
                // $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:last-child" ).width(standardDonationAmountWidth * 2 + 10);

            }, 1000);

        },

        initADF: function() {
            if ($('#dayofgiving').length !== 0) {
                BBI.Methods.fundList();
                BBI.Methods.fundSearch();
                BBI.Methods.validationMarkers();
                BBI.Methods.giftOptions();
                BBI.Methods.getTitle();
                BBI.Methods.datePicker();
                BBI.Methods.populateCountryDropdowns();
                BBI.Methods.queryParameters();
                BBI.Methods.giftAmounts();
                BBI.Methods.addGift();
                BBI.Methods.removeFromCart();

                $('#additional input[type="checkbox"]').click(function() {
                    var inputValue = $(this).attr("value");
                //   	console.log(inputValue);
                    $("." + inputValue).slideToggle();
                });  
                
                $("#startDate").attr("readOnly", "true");
                
                $("#giftTypeSelect").on("change", function() {
                    console.log($(this).val());

                    var giftTypeSelected = $(this).val();
                    if (giftTypeSelected == "One-Time") {
                        $("fieldset.toggle").addClass("hide");
                        $("fieldset.fundSelect").removeClass("hide");
                        $("fieldset#giftSummary").removeClass("hide");
                    } else if (giftTypeSelected == "Monthly") {
                        $("fieldset.Pledge.toggle").addClass("hide");
                        $("fieldset.Monthly.toggle, fieldset.fundSelect").removeClass("hide");
                        $("fieldset#giftSummary").removeClass("hide");
                    } else if (giftTypeSelected == "Pledge") {
                        $("fieldset.Monthly.toggle, fieldset.fundSelect").addClass("hide");
                        $("fieldset.Pledge.toggle").removeClass("hide");
                        $("fieldset#giftSummary").addClass("hide");
                    } else {
                        // do nothing 
                    }
                }); 

                // character counter (comments)
                let commentsLength = $("textarea#comments").attr("maxLength"),
                    commentsTextArea = $("textarea#comments");

                var maxLength = commentsLength;
                commentsTextArea.keyup(function() {
                    var textlen = maxLength - $(this).val().length;
                    $('.char-counter span').text(textlen);
                });

                // submit button event
                $('#adfSubmitButton').on('click', function(e) {
                    // prevent default action
                    e.preventDefault();
                    console.log("submit clicked!");

                    // form validation
                    if ($('#divShoppingCart').not(':visible')) {
                        console.log("divShoppingCart not visible");
                        $('#adfError').html('<span class="fa fa-exclamation-circle"></span><p style="vertical-align: middle;display: inline-block !important;">Please select a fund from above and enter an amount.</p>');
                        $('#adfError').show();
                    } else if (BBI.Methods.validateADF()) {
                        console.log("divShoppingCart is visible");
                        // hide error
                        $('#adfError').hide();

                        // get donation data
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        BBI.Methods.getDonationData();
                        // var data = BBI.Methods.getDonationData();

                        // credit card or bill me later
                        // if (BBI.Defaults.editorContent && BBI.Defaults.editorContent.MACheckoutSupported && data.Gift.PaymentMethod === 0) {
                        //     BBI.Methods.processCCPayment(data);
                        // } else {
                        //     BBI.Methods.billMeLater(data);
                        // }
                    } else {
                        // reset error
                        $('#adfError').html('<span class="fa fa-exclamation-circle"></span><p>Some required information is missing. Form submission is disabled until all required information is entered.</p>');
                    }
                });
            }
            if ($('#donation-form').length !== 0) {
                // Stepped Giving Form
                BBI.Methods.getTitle();

                BBI.Methods.formatAmount();

                if ($('#donation-form.payroll').length == 0) {
                    document.getElementById("pledgeId").addEventListener("input", function() {
                        // Replace any character that is NOT a digit (0-9) with an empty string
                        this.value = this.value.replace(/[^0-9]/g, "");
                    });
                }

                BBI.Methods.formatDatepicker(); // For recurring gift section

                //BBI.Methods.renderAmountList(BBI.Defaults.amounts);

                //BBI.Methods.renderFunds();

                // Enable navigation prompt
                window.onbeforeunload = function() {
                    //return true;
                    return 'Navigating away from this page or reloading will cancel the current donation session.  Are you sure you want to leave/reload?';
                };

                // Remove navigation prompt
                //window.onbeforeunload = null;

                // Form-specific variables
                var productName = "Online Donation"; // For ecommerce analytics
                var checkoutDescription = "Commit to UC"; // Appears on Checkout popup. No HTML allowed.

                // get domain, for easy switching between environments, if necessary
                var domain = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");

                // PartId of external ADF part, to use if donor selects the "can't find your fund" option and submits a description of a fund
                // The integer below is the 'DFJ - Redesigned Giving Form - Donor Specified Fund' part - *MAY BE DIFFERENT BETWEEN PRODUCTION AND STAGING*.
                //var altPartId = 8727;
                var altPartId = 9897; // 5261; // Part ID for alternate confirmation message for donor-specified fund

                // Indicator for whether to use altPartId - use if donor selects "can't find your fund" option.
                var useAltPartId = false;

                // variables for source code, finder number, category, subcategory, designation, amount, search, and funderTransactionId from URL
                var sourceCode;
                var finderNumber;
                var cat;
                var subcat;
                var des;
                var urlAmount;
                var urlSearch;
                var recurring;
                var hideack;
                var funderTransactionId;
                var urlDesignationGuid;
                var appealId = "c76b3daa-d211-4d15-8900-4109f1afbe3a";  // Default Appeal Code (Current: 27AG-BBIS)

                var myGift = {};
                
                // Phone validation
                var phoneValid = true;
                var acknPhoneValid = true;

                // Variables for the attribute GUIDs (add, subtract, rename as necessary)
                var otherDesignationGuid = "7f924538-ac30-4fa0-96c6-e243a2fddb12"; // generic attribute - use for "can't find your fund" functionality
                //var giftTypeGuid = "406f92fb-0dea-43df-88e6-3f7c0f7d6dcb"; // Online Gift Type // commented
                //var donorTypeGuid = "f5c0424e-f97e-438b-a7e5-8201634bb98f"; // Online Gift Donor Type // commented
                var businessNameGuid = "562152e0-b70b-4080-9270-0e9cdc7a8b1e"; // Online Donation - Organization Name // commented
                var repNameGuid = "9f7369d0-a6ca-4faf-bf04-b2e8cc992f1a"; // Online Donation - Organization Representative Name
                var repTitleGuid = "e533e43d-e96c-4277-929f-449d178b3b8c"; // Online Donation - Organization Title
                var funderTransactionGuid = "9AD6ADE3-6342-4DC7-AE21-2EDBA8984530"; // Funder Transaction ID

                var employer = "126739cb-50c9-4f1f-8c69-31a5625cbb3f";
                var payrollDeductionMNumber = "d3b28f46-5db5-4e83-8d40-42313da72d42";

                // global array for designations
                var designationArray = [];
                var customAttributes = [];

                // Appeal ID
                if (!!BBI.Methods.returnQueryValueByName("appeal")) {
                    appealId = BBI.Methods.returnQueryValueByName("appeal");
                }

                // Start: PHONE VALIDATION
                const phoneInput = document.querySelector("#phone");                
                const iti = window.intlTelInput(phoneInput, {
                    initialCountry: "us",
                    strictMode: true,
                    separateDialCode: true,
                    countryOrder: ["us", "ca", "gb"],
                    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@16.0.3/build/js/utils.js"
                });

                let showValidation = false;

                const updateUI = () => {
                    if (!showValidation) return;

                    let invalidMsg = "";
                    phoneValid = true;
                    if (!iti.isValidNumber()) {
                        const errorCode = iti.getValidationError();
                        // console.log(errorCode);
                        phoneValid = false;
                    }
                    // console.log("invalidMsg: " + invalidMsg);
                };

                // on blur: enable validation UI
                phoneInput.addEventListener("blur", () => {
                    showValidation = true;
                    updateUI();
                });                

                phoneInput.addEventListener("input", updateUI);
                phoneInput.addEventListener("countrychange", updateUI);

                window.iti = iti;

                if ($('#donation-form.payroll').length == 0) {
                    const acknPhoneInput = document.querySelector("#acknowledgeePhone");
                    const itiAckn = window.intlTelInput(acknPhoneInput, {
                        initialCountry: "us",
                        strictMode: true,
                        separateDialCode: true,
                        countryOrder: ["us", "ca", "gb"],
                        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@16.0.3/build/js/utils.js"
                    });

                    let acknShowValidation = false;

                    const acknUpdateUI = () => {
                        if (!acknShowValidation) return;

                        let invalidMsgAckn = "";
                        acknPhoneValid = true;
                        if (!iti.isValidNumber()) {
                            const errorCode = iti.getValidationError();
                            // console.log(errorCode);
                            acknPhoneValid = false;
                        }
                        // console.log("invalidMsg: " + invalidMsgAckn);
                    };

                    acknPhoneInput.addEventListener("blur", () => {
                        acknShowValidation = true;
                        acknUpdateUI();
                    });

                    acknPhoneInput.addEventListener("input", acknUpdateUI);
                    acknPhoneInput.addEventListener("countrychange", acknUpdateUI);

                    /* const validationError = {
                        IS_POSSIBLE: 0,
                        INVALID_COUNTRY_CODE: 1,
                        TOO_SHORT: 2,
                        TOO_LONG: 3,
                        IS_POSSIBLE_LOCAL_ONLY: 4,
                        INVALID_LENGTH: 5
                    }; */

                    window.itiAckn = itiAckn;
                }                               

                // End: PHONE VALIDATION

                // Start: EMAIL MISSPELL VALIDATION
                Mailcheck.defaultDomains.push("foundation.uc.edu", "uc.edu", "ucmail.uc.edu", "uchealth.com");
                var $email = $("#emailAddress"); // Cache jQuery objects into variables
                var $hint = $("#hint");                

                $email.on("blur", function () {
                    // console.log("trigger email check");
                    $hint.css("display", "none"); // Hide the hint
                    $(this).mailcheck({
                        suggested: function (element, suggestion) {
                            if (!$hint.html()) {
                                // First error - fill in/show entire hint element
                                var suggestion =
                                    "Did you mean <span class='suggestion'>" +
                                    "<span class='infoAddress'>" +
                                    suggestion.address +
                                    "</span>" +
                                    "@<a href='#' class='domain'>" +
                                    suggestion.domain +
                                    "</a></span>?";

                                $hint.html(suggestion).fadeIn(150);
                            } else {
                                // Subsequent errors
                                $(".infoAddress").html(suggestion.address);
                                $(".domain").html(suggestion.domain);
                            }
                        }
                    });
                });

                // After our other code:
                $hint.on("click", ".domain", function () {
                    // On click, fill in the field with the suggestion and remove the hint
                    $email.val($(".suggestion").text());
                    $hint.fadeOut(200, function () {
                        $(this).empty();
                    });
                    return false;
                });

                if ($('#donation-form.payroll').length == 0) {
                    var $acknEmail = $("#acknowledgeeEmailAddress"); // Cache jQuery objects into variables
                    var $acknHint = $("#acknHint");

                    $acknEmail.on("blur", function () {
                        $acknHint.css("display", "none"); // Hide the hint
                        $(this).mailcheck({
                            suggested: function (element, acknSuggestion) {
                                if (!$acknHint.html()) {
                                    // First error - fill in/show entire hint element
                                    var acknSuggestion =
                                        "Did you mean <span class='acknSuggestion'>" +
                                        "<span class='acknAddress'>" +
                                        acknSuggestion.address +
                                        "</span>" +
                                        "@<a href='#' class='acknDomain'>" +
                                        acknSuggestion.domain +
                                        "</a></span>?";

                                    $acknHint.html(acknSuggestion).fadeIn(150);
                                } else {
                                    // Subsequent errors
                                    $(".acknAddress").html(acknSuggestion.address);
                                    $(".acknDomain").html(acknSuggestion.domain);
                                }
                            }
                        });
                    });

                    // After our other code:
                    $acknHint.on("click", ".acknDomain", function () {
                        // On click, fill in the field with the suggestion and remove the hint
                        $acknEmail.val($(".acknSuggestion").text());
                        $acknHint.fadeOut(200, function () {
                            $(this).empty();
                        });
                        return false;
                    });
                }
                // End: EMAIL MISSPELL VALIDATION

                if ($("#startMonth").length !== 0) {
                    // console.log("#startMonth");
                    // var d = new Date(),
                    //     day = d.getDate();

                    // function getMinDate() {
                    //     var date = new Date();

                    //     date.setMonth(date.getMonth() + 1, 1);
                        
                    //     return date;
                    // }

                    // $("#startMonth").datepicker({
                    //     changeMonth: true,
                    //     changeYear: true,
                    //     showButtonPanel: true,
                    //     dateFormat: 'MM yy',
                    //     onClose: function(dateText, inst) {
                    //         $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                    //     },
                    //     minDate: getMinDate(),
                    // });

                    // $("#startMonth").datepicker("setDate", getMinDate()).attr('data-date', getMinDate());

                    var d = new Date(),
                        day = d.getDate();

                    function getMinDate() {
                        var date = new Date();

                        date.setMonth(date.getMonth() + 1, 1);
                        return date;
                    }

                    $("#startMonth").datepicker({
                        changeMonth: true,
                        changeYear: true,
                        showButtonPanel: true,
                        dateFormat: 'MM yy',
                        onClose: function(dateText, inst) {
                            $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
                        },
                        minDate: getMinDate(),
                    });

                    $("#startMonth").datepicker("setDate", getMinDate()).attr('data-date', getMinDate());
                }

                // character counter (comments)
                let commentsLength = $("#comments").attr("maxLength"),
                    commentsTextArea = $("#comments");

                var maxLength = commentsLength;
                commentsTextArea.keyup(function() {
                    var textlen = maxLength - $(this).val().length;
                    $('.char-counter span').text(textlen);
                });

                if ($("#donation-form.payroll").length !== 0) {
                    // Number of pay periods cant be blank.
                    // This script returns value to previously set value if user clears out text field and 
                    // clicks away from # of pay periods text field.
                    const installmentInput = document.getElementById('numberOfInstallments');
                    const installmentAmountInput = document.getElementById('installmentAmount');

                    // Initialize with the current value
                    let previousValue = "";
                    let lastValidValue = "";

                    installmentInput.addEventListener("focus", function() {
                        previousValue = this.value;
                        lastValidValue = installmentAmountInput.value;
                    });

                    installmentInput.addEventListener("blur", function() {
                        if (this.value.trim() === "") {
                            this.value = previousValue;
                            installmentAmountInput.value = lastValidValue;
                        }
                    });

                    document.getElementById("employerName").addEventListener("change", function() {
                        const selectedEmployerName = this.options[this.selectedIndex].text;
                        const employeeIDfield = document.getElementById("employeeID");
                        employeeIDfield.disabled = false;
                        if (selectedEmployerName == "UC Health") {
                            employeeIDfield.placeholder = "Enter employee ID";
                            employeeIDfield.classList.add("uchealth");
                            employeeIDfield.maxLength = 8;
                            employeeIDfield.value = "";
                        } else {
                            employeeIDfield.placeholder = "Enter M#";
                            employeeIDfield.classList.remove("uchealth");
                            employeeIDfield.maxLength = 9;
                            employeeIDfield.value = "";
                        }
                    });

                    // M#/UCID must start with a capital M followed by eight numbers.
                    // This script makes sure the user has to type "M" followed by eight numbers.
                    // Script will only allow user to type ONE "M" for first character
                    // and only EIGHT numbers following the "M".
                    const employeeIDinput = document.getElementById("employeeID");

                    employeeIDinput.addEventListener("input", function() {
                        if (employeeIDinput && employeeIDinput.classList.contains("uchealth")) {
                            // Only allow digits
                            this.value = this.value.replace(/\D/g, '');
                        } else {
                            let value = this.value.toUpperCase();
                            
                            // Ensure the first character is 'M'
                            if (value.length > 0 && value[0] !== 'M') {
                                value = 'M' + value.replace(/[^0-9]/g, '');
                            }
                            
                            // Remove any non-numeric characters after the first character
                            // and limit total length to 9 (M + 8 digits)
                            let mPart = value.substring(0, 1);
                            let numberPart = value.substring(1).replace(/[^0-9]/g, '').substring(0, 8);
                            
                            this.value = mPart + numberPart;
                        }
                    });
                }

                if (BLACKBAUD.api.pageInformation.rootPath === "https://giveto.uc.edu/") {
                    // Google Analytics - Google Tag Manager code would go here.
                }

                jQuery(document).ready(function($) {
                    $("a.c-logo__link").attr("href", "https://foundation.uc.edu");
                });

                // Gift Session class
                var GiftSession = function(
                    paymentMethod,
                    merchantAcct,
                    finderNumber,
                    sourceCode
                ) {
                    // counter for number of gifts currently in session
                    this.giftCount = 0;

                    // properties:
                    this.donation = {
                        giftRecurrence: false,
                        giftTribute: false,
                        giftAcknowledgee: false,
                        giftPledge: false,
                        giftFacStaff: false,

                        // Donor information
                        Donor: {
                            Title: $(".donor #personalTitle").val().trim(),
                            FirstName: $(".donor #firstName").val().trim(),
                            LastName: $(".donor #lastName").val().trim(),
                            Address: {
                                StreetAddress: $(".donor .address #streetAddress").val().trim(),
                                City: $(".donor .address #city").val().trim(),
                                State: $(".donor .address #state").val().trim(),
                                PostalCode: $(".donor .address #postalCode").val().trim(),
                                Country: $(".donor .address #country :selected").text()
                            },
                            EmailAddress: $(".donor #emailAddress").val().trim(),
                            Phone: $(".donor #phone").val().trim(),
                            // OrganizationName: $("#companyName").val()
                        },
                        // Gift information
                        Gift: {
                            Attributes: [],
                            Designations: [], // designation/amount pairs (a JS object for each... Ex. {Amount: 35, DesignationId: "3439a5c7-9977-4f9c-ba11-fadfb8144d35"}) will be added/removed dynamically when update is run
                            // PledgeInstallment: [{
                            //     InstallmentAmount: $(".installmentAmount-input #installmentAmount").val(),
                            //     NumberOfInstallments: $(".numberOfInstallments-input #numberOfInstallments").val()
                            // }],
                            FinderNumber: finderNumber,
                            SourceCode: sourceCode,
                            IsAnonymous: false,
                            IsCorporate: false,
                            // PaymentMethod: document.querySelector('.donationForm').classList.contains('payroll') ? 1 : 0,
                            // PaymentMethod: paymentMethod, // pass this to instance, default to 0.
                            PaymentMethod: document.querySelector('div.donationForm.payroll') ? 1 : 0,
                            Comments: "",
                            CreateGiftAidDeclaration: false,
                            Recurrence: {
                                Frequency: $(".gift .recurrence .frequency").val(),
                                /* Month: "", */
                                DayOfMonth: "", 
                                StartDate: $(".gift .recurrence .startDate").val(),
                                // EndDate: $(".gift .recurrence .endDate").val()
                            }
                        },
                        PartId: $(".BBDonationApiContainer").data("partid"),
                        Origin: {
                            AppealId: appealId,
                            PageId: BLACKBAUD.api.pageInformation.pageId,
                            PageName: "Commit to UC Donation Form"
                        },
                        BBSPReturnUri: window.location.href,
                        BBSPTemplateSitePageId: BLACKBAUD.api.pageInformation.pageId,
                        MerchantAccountId: merchantAcct
                    };
                };

                /* Begin GiftSession functions */
                GiftSession.prototype.update = function() {
                    if ($('#donation-form.payroll').length !== 0) {
                        this.donation.giftFacStaff = true;
                        this.donation.Origin.AppealId = $("#employerName").val();
                    } else {
                        this.donation.giftFacStaff = false;
                        this.donation.Origin.AppealId = appealId;
                    }

                    // if ($("#recurringGift").prop("checked") == true) {
                    // if ($("#giftType").val() == "Monthly") {

                    var countryCodePrefix = $(".donor .phone-input ul.iti__country-list > li[aria-selected='true']").data("dial-code");
                    var phoneCountryCode = $(".donor .phone-input ul.iti__country-list > li[aria-selected='true']").data("country-code");
                    // console.log("countryCodePrefix " + countryCodePrefix);
                    // console.log("phoneCountryCode " + phoneCountryCode);

                    var phoneValue = document.getElementById("phone").value;
                    if (phoneValue.trim().length === 0) {                                       
                        countryCodePrefix = "";
                    } else {                        
                        if (phoneCountryCode == "us") {
                            countryCodePrefix = "";
                        } else {
                            countryCodePrefix = "+" + countryCodePrefix + " ";
                        }
                    }

                    // Gift type
                    // If RECURRING and TRIBUTE --> 
                    if ($(".gift-type a#Monthly").hasClass("selected")) {
                        this.donation.giftRecurrence = true;
                        document.querySelectorAll('a.onetime').forEach(link => {
                            link.classList.add('hide');
                        });
                        document.querySelectorAll('a.recurring').forEach(link => {
                            link.classList.remove('hide');
                        });
                    } else {
                        this.donation.giftRecurrence = false;
                        document.querySelectorAll('a.onetime').forEach(link => {
                            link.classList.remove('hide');
                        });
                        document.querySelectorAll('a.recurring').forEach(link => {
                            link.classList.add('hide');
                        });
                    }

                    if ($(".gift-type a#Monthly").hasClass("selected") || $(".gift-type a#One-Time").hasClass("selected")) {
                        if (this.donation.giftPledge) {
                            this.donation.Gift.Designations = [];
                            $("#pledgeId, #pledgeAmount").val("");
                            $("#cancelAddLineItem, #giftSummary").hide();
                        } else {
                            if (this.donation.Gift.Designations.length < 1) {
                                $("#cancelAddLineItem, #giftSummary").hide();
                            } else {
                                $("#cancelAddLineItem, #giftSummary").show();
                            }
                        }                        
                    }

                    if ($(".gift-type a#Pledge").hasClass("selected")) {
                        this.donation.giftPledge = true;
                    } else {
                        this.donation.giftPledge = false;
                    }

                    // Tribute 
                    if ($(".gift #tributeCheckbox").prop("checked") == true) {
                        if (this.donation.giftRecurrence) {
                            this.donation.giftTribute = false;
                        } else {
                            this.donation.giftTribute = true;
                        }
                    } else {
                        this.donation.giftTribute = false;
                        $(".gift #chkAcknowledge").prop("checked", false);
                        this.donation.giftAcknowledgee = false;
                    }
                    if ($(".gift #chkAcknowledge").prop("checked") == true) {
                        this.donation.giftAcknowledgee = true;
                    } else {
                        this.donation.giftAcknowledgee = false;
                    }

                    // const fullNumber = iti.getNumber(); 
                    // console.log("fullNumber: " + fullNumber); 

                    // Donor data
                    this.donation.Donor = {
                        Title: $(".donor #personalTitle").val().trim(),
                        FirstName: $(".donor #firstName").val().trim(),
                        LastName: $(".donor #lastName").val().trim(),
                        Address: {
                            StreetAddress: $(".donor .address #streetAddress").val().trim(),
                            City: $(".donor .address #city").val().trim(),
                            State: $(".donor .address #state").val().trim(),
                            PostalCode: $(".donor .address #postalCode").val().trim(),
                            Country: $(".donor .address #country :selected").text()
                        },
                        EmailAddress: $(".donor #emailAddress").val().trim(),
                        Phone: $(".donor #phone").val(), //iti.getNumber(), // $(".donor .phone").val(),
                        // OrganizationName: $("#companyName").val()
                    };

                    var jointGiftName = "";
                    if ($("#isJointGift").prop("checked") == true) {                        
                        jointGiftName = "Joint gift" + "\n" + $("#spouse").val() + "\n" + "\n";
                    }

                    // Anonymous
                    if ($("#anonymousCheckbox:checked").length !== 0) {
                        this.donation.Gift.IsAnonymous = true;
                    } else {
                        this.donation.Gift.IsAnonymous = false;
                    }

                    // conditional for corporate 
                    if ($('#donation-form.payroll').length == 0) {
                        if ($("#corporateGift").is(":checked")) {
                            this.donation.Gift.IsCorporate = true;
                            this.donation.Donor.OrganizationName = $("#companyName").val();
                        } else {
                            // document.getElementById("companyName").value = "";
                            this.donation.Gift.IsCorporate = false;
                            this.donation.Donor.OrganizationName = null;
                        }
                    }

                    if (funderTransactionId) {
                        this.donation.Gift.Attributes.push({
                            AttributeId: funderTransactionGuid,
                            Value: funderTransactionId,
                            Name: "Cincinnati Funder Transaction ID"
                        });
                    }

                    var pledgeIdComment = "";
                    // add pedge info, if "Pledge payment" if chosen
                    if (this.donation.giftPledge) {
                        this.donation.Gift.Designations = [{
                            Amount: $("#pledgeSection input#pledgeAmount").val(),
                            DesignationId: "6f0e4d60-1df1-495a-9e01-82b3e9d91aff"
                        }];

                        pledgeIdComment = "Pledge payment" + "\n" + "Pledge ID: " + $("#pledgeSection input#pledgeId").val() + "\n" + "\n";
                    } else {
                        // do nothing
                    }

                    var corporateGiftComment = "";
                    if (this.donation.Gift.IsCorporate) {
                        corporateGiftComment =  "Company gift" + "\n" + $("#companyName").val() + "\n" + "\n";
                    }

                    var matchingGiftComment = "";
                    if ($('.dtd-company-selected-name').length !== 0) {
                        matchingGiftComment = "Matching gift" + "\n" + $(".dtd-company-selected-name").text() + "\n" + "\n";
                    }

                    var commentsValue = "";
                    if ($("#comments").val() != "") {                        
                        commentsValue = $("#comments").val() + "\n" + "\n";
                    }

                    var giftTributeValue = "";
                    if (this.donation.giftTribute) {
                        const ddlTribute = document.getElementById("ddlTribute").value.charAt(0).toUpperCase() + document.getElementById("ddlTribute").value.slice(1) + " ";
                        const honoreeName = $("#txtTributeFirstName").val() + " " + $("#txtTributeLastName").val() + "\n";
                        
                        if (this.donation.giftAcknowledgee) {
                            const acknName = "\n" + "Acknowledgee" + "\n" + $("#txtAcknowledgeeFirstName").val() + " " + $("#txtAcknowledgeeLastName").val() + "\n" + "\n";
                            const acknAddress = $("#acknowledgeeStreetAddress").val() + "\n" + $("#acknowledgeeCity").val() + ", " + $("#acknowledgeeState").val() + " " + $("#acknowledgeePostalCode").val() + "\n";
                            const giftAcknowledgeeComments = acknName;

                            giftTributeValue = ddlTribute + honoreeName + giftAcknowledgeeComments;
                        } else {
                            giftTributeValue = ddlTribute + honoreeName;
                        }
                    }

                    if (pledgeIdComment == "" && jointGiftName == "" && tributeDescription == "" && corporateGiftComment == "" && matchingGiftComment == "" && commentsValue == "" && commentsValue == "") {
                        commentsValue = "No additional gift details."
                    }

                    var tributeDescription = "";
                    if (this.donation.giftRecurrence && $("#txtTributeDescription").val() != "") {                        
                        tributeDescription = "Tribute instructions" + "\n" + $("#txtTributeDescription").val() + "\n" + "\n";
                    }

                    this.donation.Gift.Comments = pledgeIdComment + jointGiftName + tributeDescription + corporateGiftComment + matchingGiftComment + commentsValue + giftTributeValue;
                    this.donation.Gift.FinderNumber = finderNumber;
                    this.donation.Gift.SourceCode = sourceCode;

                    if ($('#donation-form.payroll').length !== 0) {
                        var payrollDeductionMNumber = {
                            AttributeId: BBI.Defaults.payrollDeductionMNumber,
                            Value: $("#employeeID").val()
                        };
                        this.donation.Gift.Attributes.push(payrollDeductionMNumber);

                        var employerValue = {
                            AttributeId: BBI.Defaults.employer,
                            Value: $('#employerName option:selected').text()
                        };
                        this.donation.Gift.Attributes.push(employerValue);
                    }

                    // Gift data
                    // update radio button for 'other' with what's in the input field
                    $(".gift .designations input[name='amount'][id='otherAmount']").val(
                        $(".gift .designations #otherAmountInput").val()
                    );

                    // add recurrence info, if "recurring gift" is chosen
                    if (this.donation.giftRecurrence) {
                        this.donation.Gift.Recurrence = {
                            Frequency: $(".gift .recurrence .frequency").val(),
                            // Month: Number($(".gift .recurrence .startDate").val().split("/")[0].replace(/^0+/, "")),
                            DayOfMonth: Number($(".gift .recurrence .startDate").val().split("/")[1].replace(/^0+/, "")), 
                            StartDate: $(".gift .recurrence .startDate").val()
                        };
                    } else {
                        this.donation.Gift.Recurrence = null;
                    }
                    // if (
                    //     document.getElementById("endDateCheckbox").checked &&
                    //     $("#endDate").val() &&
                    //     this.donation.giftRecurrence
                    // ) {
                    //     this.donation.Gift.Recurrence.EndDate = $(
                    //         ".gift .recurrence .endDate"
                    //     ).val();
                    // }

                    var acknCountryCodePrefix = "";
                    if ($(".gift .tribute .acknowledgee .phone").val() != "") {
                        var acknPhoneCountryCode = $(".donor .ackn-phone-input ul.iti__country-list > li[aria-selected='true']").data("country-code");                    
                        if (acknPhoneCountryCode == "us") {
                            acknCountryCodePrefix = "";
                        } else {
                            // console.log("acknCountryCodePrefix " + acknCountryCodePrefix);
                            acknCountryCodePrefix = "+" + $(".donor .ackn-phone-input ul.iti__country-list > li[aria-selected='true']").data("dial-code") + " ";
                        }
                    } else {
                        acknCountryCodePrefix = "";
                    }

                    if (this.donation.giftFacStaff) {
                        var numberOfInstallmentsValue = document.getElementById("numberOfInstallments").value,
                            installmentAmount = document.getElementById("installmentAmount").value.replace('$', '').replace(',', '');

                        // this.donation.Gift.PledgeInstallment = [{
                        //     InstallmentAmount: installmentAmount,
                        //     NumberOfInstallments: parseInt(document.getElementById("numberOfInstallments").value)
                        // }];

                        var numberOfInstallments = parseInt($('#numberOfInstallments').val());
                        if (numberOfInstallments) {
                            var giftAmount = $("#totalGift").val().replace("$", "").replace(",", "");

                            var installmentAmount = ds.getRecurringGiftInstallmentAmount(giftAmount, numberOfInstallments);

                            this.donation.Gift.PledgeInstallment = {
                                NumberOfInstallments: numberOfInstallments,
                                InstallmentAmount: installmentAmount
                            } 
                        }
                    } else {
                        // do nothing
                    }                    

                    /* Check to see if the donor has used the "Can't find your fund" option.
                    If so, set an attribute with the donor's fund description, 
                    and switch to the alternate part ID, so that the onscreen 
                    and email confirmation text will show the designation as "donor specified." */
                    var desObj = this.donation.Gift.Designations;
                    //console.log(desObj);

                    for (var i = 0; i < this.donation.Gift.Designations.length; i++) {
                        //console.log(this.donation.Gift.Designations[i].Description);
                        if (
                            typeof this.donation.Gift.Designations[i].Description != "undefined" &&
                            this.donation.Gift.Designations[i].Description.replace(" ", "").length > 1
                        ) {
                            //console.log(desObj[i].Name);
                            this.donation.Gift.Attributes.push({
                                AttributeId: otherDesignationGuid,
                                Value: this.donation.Gift.Designations[i].Description +
                                    " - $" +
                                    this.donation.Gift.Designations[i].Amount
                            });
                            //useAltPartId = true;
                            // specify alternate PartId in gift object - must also be specified in call to Donation API
                            this.donation.PartId = altPartId;
                        } else {
                            this.donation.PartId = $(".BBDonationApiContainer").data("partid");
                        }
                    }
                    //console.log("this.donation...");console.log(this.donation);
                };

                GiftSession.prototype.updateAttributes = function() {
                    // reset customAttributes value. Add values if present.
                    customAttributes = [];

                    // add pedge info, if "Pledge payment" if chosen
                    if (this.donation.giftPledge) {
                        var pledgeId = {
                            AttributeId: BBI.Defaults.customADFAttributes["Pledge ID"],
                            Value: $("#pledgeSection input#pledgeId").val(),
                            Name: "Pledge ID"
                        };
                        customAttributes.push(pledgeId);
                    }

                    if ($('#donation-form.payroll').length == 0) {
                        // conditional for tribute
                        // tribute (honoree) attributes
                        if (this.donation.giftRecurrence) {

                        } else {
                            if ($("input#tributeCheckbox:checked").length !== 0) {
                                if ($("#ddlTribute").length !== 0) {
                                    var tributeType = {
                                        AttributeId: BBI.Defaults.customADFAttributes["Tribute Gift Type"],
                                        Value: document.getElementById("ddlTribute").value,
                                    };
                                    customAttributes.push(tributeType);
                                }
                                if ($("#txtTributeFirstName").length !== 0 && $("#txtTributeLastName").length !== 0) {
                                    var honoreeName = {
                                        AttributeId: BBI.Defaults.customADFAttributes["Honoree Name"],
                                        Value: $("#txtTributeFirstName").val() + " " + $("#txtTributeLastName").val(),
                                    };
                                    customAttributes.push(honoreeName);
                                }
                            }
                        }

                        // acknowledgee attributes
                        if ($("input#chkAcknowledge:checked").length !== 0) {
                            if ($("#txtAcknowledgeeFirstName").length !== 0) {
                                var ackFirstName = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee First Name"
                                    ],
                                    Value: $("#txtAcknowledgeeFirstName").val(),
                                };
                                customAttributes.push(ackFirstName);
                            }
                            if ($("#txtAcknowledgeeLastName").length !== 0) {
                                var ackLastName = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee Last Name"
                                    ],
                                    Value: $("#txtAcknowledgeeLastName").val(),
                                };
                                customAttributes.push(ackLastName);
                            }
                            if ($("#acknowledgeeStreetAddress").length !== 0) {
                                var ackAddress = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee Address"
                                    ],
                                    Value: $("#acknowledgeeStreetAddress").val(),
                                };
                                customAttributes.push(ackAddress);
                            }
                            if ($("#acknowledgeeCity").length !== 0) {
                                var ackCity = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee City"
                                    ],
                                    Value: $("#acknowledgeeCity").val(),
                                };
                                customAttributes.push(ackCity);
                            }
                            if ($("#acknowledgeeState").length !== 0) {
                                var ackState = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee State"
                                    ],
                                    Value: $("#acknowledgeeState").val(),
                                };
                                customAttributes.push(ackState);
                            }
                            if ($("#acknowledgeePostalCode").length !== 0) {
                                var ackZip = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee Zip"
                                    ],
                                    Value: $("#acknowledgeePostalCode").val(),
                                };
                                customAttributes.push(ackZip);
                            }
                            if ($("#acknowledgeeCountry").length !== 0) {
                                var ackCountry = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee Country"
                                    ],
                                    Value: $("#acknowledgeeCountry option:selected").text(),
                                };
                                customAttributes.push(ackCountry);
                            }
                            if (
                                $("#acknowledgeePhone").length !== 0 && $("#acknowledgeePhone").val() !== "") {
                                var ackPhone = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee Phone"
                                    ],
                                    Value: $("#acknowledgeePhone").val(),
                                };
                                customAttributes.push(ackPhone);
                            }
                            if (
                                $("#acknowledgeeEmailAddress").length !== 0 &&$("#acknowledgeeEmailAddress").val() !== "") {
                                var ackEmail = {
                                    AttributeId: BBI.Defaults.customADFAttributes[
                                        "Acknowledgee Email"
                                    ],
                                    Value: $("#acknowledgeeEmailAddress").val(),
                                };
                                customAttributes.push(ackEmail);
                            }
                        }
                    } else {
                        // if (this.donation.giftFacStaff) {
                            var numberOfInstallmentsValue = document.getElementById("numberOfInstallments").value,
                                installmentAmount = document.getElementById("installmentAmount").value.replace('$', '').replace(',', '');

                            // this.donation.Gift.PledgeInstallment = [{
                            //     InstallmentAmount: installmentAmount,
                            //     NumberOfInstallments: parseInt(document.getElementById("numberOfInstallments").value)
                            // }];

                            var numberOfInstallments = parseInt($('#numberOfInstallments').val());
                            if (numberOfInstallments) {
                                var giftAmount = $("#totalGift").val().replace("$", "").replace(",", "");

                                var installmentAmount = ds.getRecurringGiftInstallmentAmount(giftAmount, numberOfInstallments);

                                this.donation.Gift.PledgeInstallment = {
                                    NumberOfInstallments: numberOfInstallments,
                                    InstallmentAmount: installmentAmount
                                } 
                            }
                        // }
                    }

                    // Matching gift
                    if ($('.dtd-company-selected-name').length !== 0) {
                        var company = {
                            "AttributeId": BBI.Defaults.customADFAttributes['Matching Gift Company'],
                            "Value": $(".dtd-company-selected-name").text()
                        };
                        console.log(company);
                        customAttributes.push(company); 
                    }

                    myGift.donation.Gift.Attributes = customAttributes;
                    // console.log("Attributes");
                    // console.log(myGift.donation.Gift.Attributes);
                };

                GiftSession.prototype.validate = function(step, amt, designation, descr) {
                    // if ($('#dd-input').length !== 0) {
                    //     const doubleDonationInput = document.getElementById("dd-company-name-input");
                    //     doubleDonationInput.setAttribute("autocomplete", "new-password");
                    // }

                    if ($('#phone').length !== 0) {
                        const phoneNumberInput = document.getElementById("phone");
                        phoneNumberInput.setAttribute("autocomplete", "new-password");
                    }

                    if ($('#acknowledgeePhone').length !== 0) {
                        const acknPhoneNumberInput = document.getElementById("acknowledgeePhone");
                        acknPhoneNumberInput.setAttribute("autocomplete", "new-password");
                    }

                    //console.log('validate step ' + step);
                    // $("#otherAmtInstr").hide();
                    var errs = "";
                    $(".validation-message").remove();

                    if (step == 1) {
                        // STEP 1 - GIFT DETAILS
                        // validation for amount
                        amt = Number(amt);
                        // if (amt < 5 || isNaN(amt)) {
                        if (amt < 5) {
                            errs += "Gift amount minimum is $5.<br/>";
                            $(".amounts").after(
                                '<div class="validation-message">Gift amount minimum is $5.</div>'
                            );
                        }

                        if (isNaN(amt)) {
                            errs += "Gift amount is not valid.<br/>";
                            $(".amounts").after(
                                '<div class="validation-message">Gift amount is not valid.</div>'
                            );
                        }

                        if (!designation || designation == "" || designation == "default" || designation == "undefined") {
                            errs += "You must choose a fund.<br/>";
                            $(".designation-select").after(
                                '<div class="validation-message" style="margin-top: 0 !important;">You must choose a fund.</div>'
                            );
                        }

                        var desDescrCount = 0;
                        for (var i = 0; i < this.donation.Gift.Designations.length; i++) {
                            if (this.donation.Gift.Designations[i].Description) {
                                desDescrCount++;
                            }
                        }
                        
                        // if (descr.replace(" ", "").length > 0 && desDescrCount > 0) {
                        //     errs += "Only one alternate fund may be added.";
                        //     $("#otherDesignation").after(
                        //         '<div class="validation-message">Only one alternate fund may be added.</div>'
                        //     );
                        // }

                        /* Validate recurrence info */
                        if (this.donation.giftRecurrence) {
                            if (!this.donation.Gift.Recurrence.StartDate) {
                                errs += "Starting Date is required for recurring gifts.<br />";
                                $(".start-input").after(
                                    '<div class="validation-message">Starting Date is required for recurring gifts.</div>'
                                );
                            }

                            if (this.donation.Gift.Recurrence.Frequency == "select a value") {
                                errs += "Recurrence Frequency required.<br />";
                                $(".frequency-select").after(
                                    '<div class="validation-message">Recurrence Frequency required.</div>'
                                );
                            }

                            if (this.donation.Gift.Recurrence.Frequency == 4) {
                                if (this.donation.Gift.Recurrence.Month == "select a value") {
                                    errs += "Month is required for annual recurring gifts.<br />";
                                    $(".month-select").after(
                                        '<div class="validation-message">Month is required for annual recurring gifts.</div>'
                                    );
                                }
                            }
                        }
                    }                    

                    if ($('#donation-form.payroll').length !== 0) {
                        if (step == 2) {
                            // add payroll deduction validation here
                            // Number of installments
                            // console.log("NumberOfInstallments: " + this.donation.Gift.PledgeInstallment.NumberOfInstallments);
                            // var getNumberOfInstallmentsValue = $("#numberOfInstallments").val();
                            // var getInstallmentAmountValue = $('#installmentAmount').val().replace('$', '').replace(',', '');
                            
                            // Get the currently checked radio button with the name 'pay_period'
                            const selectedPayPeriod = document.querySelector('input[name="pay_period"]:checked');

                            // if (selectedPayPeriod) {
                            const payValue = selectedPayPeriod.value;

                            if (payValue === 'Monthly') {
                                // Do something for Monthly
                                console.log('Pay period is Monthly.');
                                const installments = document.getElementById("numberOfInstallments").value;
                                if (installments > 12) {
                                    errs += "Cannot exceed 12 pay periods.<br/>";
                                    $(".numberOfInstallments-input div.req-field").append(
                                        '<div class="validation-message">Cannot exceed 12 pay periods.</div>'
                                    );
                                }
                            } else  {
                                // if (payValue === 'Bi-weekly')
                                // Do something for Bi-weekly
                                console.log('Pay period is Bi-weekly.');
                                const installments = document.getElementById("numberOfInstallments").value;
                                if (installments > 26) {
                                    errs += "Cannot exceed 26 pay periods.<br/>";
                                    $(".numberOfInstallments-input div.req-field").append(
                                        '<div class="validation-message">Cannot exceed 26 pay periods.</div>'
                                    );
                                }
                            } 
                            // else {
                            //     // Handle other values
                            //     console.log('Unknown pay period.');
                            // }
                            // } else {
                            //     // Handle the case where no radio button is selected
                            //     console.log('No pay period selected.');
                            // }


                            // if (!this.donation.Gift.PledgeInstallment.NumberOfInstallments) {
                            // if (getNumberOfInstallmentsValue = "") {
                            //     errs += "Number of installments is required.<br/>";
                            //     $(".numberOfInstallments-input div").append(
                            //         '<div class="validation-message">Number of installments is required.</div>'
                            //     );
                            // } else {
                            //     this.donation.Gift.PledgeInstallment = {
                            //         NumberOfInstallments: parseInt(document.getElementById("numberOfInstallments").value),
                            //         InstallmentAmount: getInstallmentAmountValue
                            //     };
                            // }
                        }

                        if (step == 3) {
                            // STEP 3 - INFORMATION
                            // step 2 - validation for recurrence, business, and tribue/acknowledgee info

                            // var giftType = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Gift Type";
                            // })[0];
                            // var donorType = this.donation.Gift.Attributes.filter(function (obj) {
                            //     return obj.Name == "Donor Type";
                            // })[0];
                            // var orgName = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Organization Name";
                            // })[0];
                            // var repName = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Representative Name";
                            // })[0];
                            // var repTitle = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Representative Title";
                            // })[0];
                            // var comments = this.donation.Gift.Comments;

                            /* Validate gift items */
                            // check for at least one designation/amount
                            // if ($(".gift-type a#Pledge").hasClass("selected")) {
                            //     // Do nothing since no gifts need to be added.
                            // } else {
                            //     if (this.donation.Gift.Designations.length < 1) {
                            //         console.log("Error A");
                            //         errs += "At least one gift (amount and designation) needs to be added before checking out.<br />";
                            //         $("#lineItems").after(
                            //             '<div class="validation-message">At least one gift (amount and fund) needs to be added before checking out.</div>'
                            //         );
                            //     }
                            // } 

                            // step 2 - Validate billing info

                            // Check to see if Primary employer is selected.                            
                            var employerValue = $("#employerName option:selected").val();

                            if (employerValue.length < 1) {
                                errs += "Primary employer is required.<br/>";
                                $(".employerName-select div").append(
                                    '<div class="validation-message">Primary employer is required.</div>'
                                );
                            }

                            var stateValue = document.getElementById("state");

                            //Street Address
                            if (!this.donation.Donor.Address.StreetAddress) {
                                errs += "Address is required.<br/>";
                                $(".address-input div").append(
                                    '<div class="validation-message">Address is required.</div>'
                                );
                            }

                            //City
                            if (!this.donation.Donor.Address.City) {
                                errs += "City is required.<br/>";
                                $(".city-input div").append(
                                    '<div class="validation-message">City is required.</div>'
                                );
                            }

                            // State
                            if (!this.donation.Donor.Address.State) {
                                errs += "State is required.<br/>";
                                $(".state-input div").append(
                                    '<div class="validation-message">State is required.</div>'
                                );
                            }

                            //Postal Code
                            if (!this.donation.Donor.Address.PostalCode) {
                                errs += "ZIP/Postal code is required.<br/>";
                                $(".zip-input div").append(
                                    '<div class="validation-message">ZIP/Postal code is required.</div>'
                                );
                            }

                            //Country Code
                            if (!this.donation.Donor.Address.Country) {
                                errs += "Country is required.<br/>";
                                $(".country-input div").append(
                                    '<div class="validation-message">Country is required.</div>'
                                );
                            }

                            //First Name
                            if (!this.donation.Donor.FirstName) {
                                errs += "First name is required.<br/>";
                                $(".fname-input div").append(
                                    '<div class="validation-message">First name is required.</div>'
                                );
                            }
                            //Last Name
                            if (!this.donation.Donor.LastName) {
                                errs += "Last name is required.<br/>";
                                $(".lname-input div").append(
                                    '<div class="validation-message">Last name is required.</div>'
                                );
                            }

                            //Email Address
                            this.donation.Donor.EmailAddress = this.donation.Donor.EmailAddress.replace(
                                /\s/g,
                                ""
                            );
                            if (!validateEmail(this.donation.Donor.EmailAddress)) {
                                errs += "Email is not valid.<br/>";
                                $(".email-input").append(
                                    '<div class="validation-message">Email is not valid.</div>'
                                );
                            }

                            // Joint gift
                            if ($("#isJointGift").prop("checked") == true && $('#spouse').val() == "") {
                                errs += "Spouse/partner name is required.<br/>";
                                $(".spouse-input div").append(
                                    '<div class="validation-message">Spouse/partner name is required.</div>'
                                );
                            }

                            // Corporate/company gift
                            // if ($("#corporateGift").prop("checked") == true && $('#companyName').val() == "") {
                            //     errs += "Company name is required.<br/>";
                            //     $(".companyName-input div").append(
                            //         '<div class="validation-message">Company name is required.</div>'
                            //     );
                            // }

                            //Phone
                            // if (!validatePhone(this.donation.Donor.Phone)) {
                            //     errs += "Phone is not valid.<br/>";
                            //     $(".phone-input div").append(
                            //         '<div class="validation-message">Phone number is not valid.</div>'
                            //     );
                            // }

                            if (this.donation.Donor.Phone === "") {
                                
                            } else {
                                if (phoneValid) {

                                } else {
                                    console.log("Phone number not valid");
                                    errs += "Phone is not valid.<br/>";
                                    $(".phone-input").append(
                                        '<div class="validation-message">Phone number is not valid.</div>'
                                    );
                                }
                            } 
                            
                            // Check to see if M#/UCID is valid.
                            var employeeIDValue = $("#employeeID").val();
                            if (employeeIDValue.length < 1) {
                                errs += "M#/Employee ID is required.<br/>";
                                $(".employeeId-input div").append(
                                    '<div class="validation-message">M#/Employee ID is required.</div>'
                                );
                            } else if (employeeIDValue.length < 9) {
                                const employeeField = document.getElementById("employeeID");
                                if (employeeField && employeeField.classList.contains("uchealth")) {

                                } else {
                                    errs += "Valid M#/Employee ID is required.<br/>";
                                    $(".employeeId-input div").append(
                                        '<div class="validation-message">Valid M#/Employee ID is required.</div>'
                                    );
                                }
                            } else {
                                // do nothing
                            } 

                            // check for at least one designation/amount
                            if (this.donation.Gift.Designations.length < 1) {
                                console.log("Error B");
                                errs += "At least one gift (amount and designation) needs to be added before checking out.<br />";
                                $(".billingInformation .donor").before(
                                    '<div class="validation-message">At least one gift (amount and designation) needs to be added before checking out.</div>'
                                );
                            }
                        }

                        // if (step == 4) {
                        //     /* Validate tribute info */
                        //     if (this.donation.giftTribute) {
                        //         // Honoree
                        //         /*if(!$("#txtTribute").val()) {
                        //             errs += "Honoree is required.<br />";
                        //         }*/
                        //         // First name
                        //         if (document.getElementById("txtTributeFirstName").value === "") { 
                        //             errs += "Honoree first name is required.<br />";
                        //             $(".tribute-fname-input").append(
                        //                 '<div class="validation-message">Honoree first name is required.</div>'
                        //             );
                        //         }
                        //         // Last name
                        //         // if (!this.donation.Gift.Tribute.TributeDefinition.LastName) {
                        //         if (document.getElementById("txtTributeLastName").value === "") { 
                        //             errs += "Honoree last name is required.<br />";
                        //             $(".tribute-lname-input").append(
                        //                 '<div class="validation-message">Honoree last name is required.</div>'
                        //             );
                        //         }
                        //         // Type
                        //         // if (!this.donation.Gift.Tribute.TributeDefinition.Type) {
                        //         if (document.getElementById("ddlTribute").value === "") { 
                        //             errs += "Tribute type is required.<br />";
                        //             $(".tribute-type-input").append(
                        //                 '<div class="validation-message">Tribute type is required.</div>'
                        //             );
                        //         }
                        //         // Special instructions
                        //         /*if(!this.donation.Gift.Tribute.TributeDefinition.Description) {
                        //             errs += "Special instructions/description required.<br />";
                        //             $(".tribute-instr-input").after('<div class="validation-message">Special instructions/description required.</div>');
                        //         }*/
                        //     }

                        //     /* Validate acknowledgee info */
                        //     if (this.donation.giftAcknowledgee) {
                        //         // Message recipient (acknowledgee)
                        //         /*if(!$("#txtTributeAcknFullName").val()) {
                        //             errs += "Message recipient is required.<br />";
                        //         }*/
                        //         // First name
                        //         /*if(!$("#txtAcknowledgeeFirstName").val()) {
                        //             errs += "Acknowledgee first name is required.<br />";
                        //         }*/
                        //         // Last name
                        //         // if (!this.donation.Gift.Tribute.Acknowledgee.LastName) {
                        //         if (document.getElementById("txtAcknowledgeeLastName").value === "") { 
                        //             errs += "Acknowledgee last name is required.<br />";
                        //             $(".ackn-lname-input").append(
                        //                 '<div class="validation-message">Acknowledgee last name is required.</div>'
                        //             );
                        //         }

                        //         // Street address
                        //         // if (!this.donation.Gift.Tribute.Acknowledgee.AddressLines) {
                        //         if (document.getElementById("acknowledgeeStreetAddress").value === "") { 
                        //             errs += "Acknowledgee street address is required.<br />";
                        //             $(".ackn-address-input").append(
                        //                 '<div class="validation-message">Acknowledgee street address is required.</div>'
                        //             );
                        //         }

                        //         // City
                        //         // if (!this.donation.Gift.Tribute.Acknowledgee.City) {
                        //         if (document.getElementById("acknowledgeeCity").value === "") { 
                        //             errs += "Acknowledgee city is required.<br />";
                        //             $(".ackn-city-input").append(
                        //                 '<div class="validation-message">Acknowledgee city is required.</div>'
                        //             );
                        //         }

                        //         // ZIP/Postal code
                        //         // if (!this.donation.Gift.Tribute.Acknowledgee.PostalCode) {
                        //         if (document.getElementById("acknowledgeePostalCode").value === "") { 
                        //             errs += "Acknowledgee ZIP/Postal code is required.<br />";
                        //             $(".ackn-zip-input").append(
                        //                 '<div class="validation-message">Acknowledgee ZIP/Postal code is required.</div>'
                        //             );
                        //         }

                        //         // State
                        //         // if (!this.donation.Gift.Tribute.Acknowledgee.State) {
                        //         if (document.getElementById("acknowledgeeState").value === "") { 
                        //             errs += "Acknowledgee state/province is required.<br />";
                        //             $(".ackn-state-input").append(
                        //                 '<div class="validation-message">Acknowledgee state/province is required.</div>'
                        //             );
                        //         }
                        //         // Country
                        //         // if (!this.donation.Gift.Tribute.Acknowledgee.Country) {
                        //         if (document.getElementById("acknowledgeeCountry").value === "") { 
                        //             errs += "Acknowledgee country is required.<br />";
                        //             $(".ackn-country-input").append(
                        //                 '<div class="validation-message">Acknowledgee country is required.</div>'
                        //             );
                        //         }

                        //         //Email Address
                        //         // if (this.donation.Gift.Tribute.Acknowledgee.Phone != "") {
                        //         //     if (!validateEmail(this.donation.Gift.Tribute.Acknowledgee.Email)) {
                        //         //         errs += "Acknowledgee email is not valid.<br/>";
                        //         //         $(".ackn-email-input").after('<div class="validation-message">Acknowledgee email is not valid.</div>');
                        //         //     }
                        //         // }

                        //         //Phone
                        //         // if (!validatePhone(this.donation.Gift.Tribute.Acknowledgee.Phone)){
                        //         //     errs += "Acknowledgee phone is not valid.<br/>";
                        //         //     $(".ackn-phone-input").after('<div class="validation-message">Acknowledgee phone number is not valid.</div>');
                        //         // }
                        //         // if (this.donation.Gift.Tribute.Acknowledgee.Phone === "") {
                        //         if (document.getElementById("acknowledgeeCountry").value === "") { 
                                
                        //         } else {
                                    
                        //         } 

                        //         // if (acknPhoneValid) {

                        //         // } else {
                        //         //     console.log("Phone number not valid");
                        //         //     errs += "Phone is not valid.<br/>";
                        //         //     $(".ackn-phone-input").append(
                        //         //         '<div class="validation-message">Phone number is not valid.</div>'
                        //         //     );
                        //         // }

                        //     }
                        // }
                    } else {
                        if (step == 2) {
                            // STEP 2 - INFORMATION
                            // step 2 - validation for recurrence, business, and tribue/acknowledgee info

                            // var giftType = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Gift Type";
                            // })[0];
                            // var donorType = this.donation.Gift.Attributes.filter(function (obj) {
                            //     return obj.Name == "Donor Type";
                            // })[0];
                            // var orgName = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Organization Name";
                            // })[0];
                            // var repName = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Representative Name";
                            // })[0];
                            // var repTitle = this.donation.Gift.Attributes.filter(function(obj) {
                            //     return obj.Name == "Representative Title";
                            // })[0];
                            var comments = this.donation.Gift.Comments;

                            /* Validate gift items */
                            // check for at least one designation/amount
                            // if ($(".gift-type a#Pledge").hasClass("selected")) {
                            //     // Do nothing since no gifts need to be added.
                            // } else {
                            //     if (this.donation.Gift.Designations.length < 1) {
                            //         console.log("Error A");
                            //         errs += "At least one gift (amount and designation) needs to be added before checking out.<br />";
                            //         $("#lineItems").after(
                            //             '<div class="validation-message">At least one gift (amount and fund) needs to be added before checking out.</div>'
                            //         );
                            //     }
                            // } 

                            // step 2 - Validate billing info

                            var stateValue = document.getElementById("state");

                            //Street Address
                            if (!this.donation.Donor.Address.StreetAddress) {
                                errs += "Address is required.<br/>";
                                $(".address-input div").append(
                                    '<div class="validation-message">Address is required.</div>'
                                );
                            }

                            //City
                            if (!this.donation.Donor.Address.City) {
                                errs += "City is required.<br/>";
                                $(".city-input div").append(
                                    '<div class="validation-message">City is required.</div>'
                                );
                            }

                            // State
                            if (!this.donation.Donor.Address.State) {
                                errs += "State is required.<br/>";
                                $(".state-input div").append(
                                    '<div class="validation-message">State is required.</div>'
                                );
                            }

                            //Postal Code
                            if (!this.donation.Donor.Address.PostalCode) {
                                errs += "ZIP/Postal code is required.<br/>";
                                $(".zip-input div").append(
                                    '<div class="validation-message">ZIP/Postal code is required.</div>'
                                );
                            }

                            //Country Code
                            if (!this.donation.Donor.Address.Country) {
                                errs += "Country is required.<br/>";
                                $(".country-input div").append(
                                    '<div class="validation-message">Country is required.</div>'
                                );
                            }

                            //First Name
                            if (!this.donation.Donor.FirstName) {
                                errs += "First name is required.<br/>";
                                $(".fname-input div").append(
                                    '<div class="validation-message">First name is required.</div>'
                                );
                            }
                            //Last Name
                            if (!this.donation.Donor.LastName) {
                                errs += "Last name is required.<br/>";
                                $(".lname-input div").append(
                                    '<div class="validation-message">Last name is required.</div>'
                                );
                            }

                            //Email Address
                            this.donation.Donor.EmailAddress = this.donation.Donor.EmailAddress.replace(
                                /\s/g,
                                ""
                            );
                            if (!validateEmail(this.donation.Donor.EmailAddress)) {
                                errs += "Email is not valid.<br/>";
                                $(".email-input").append(
                                    '<div class="validation-message">Email is not valid.</div>'
                                );
                            }

                            // Joint gift
                            if ($("#isJointGift").prop("checked") == true && $('#spouse').val() == "") {
                                errs += "Spouse/partner name is required.<br/>";
                                $(".spouse-input div").append(
                                    '<div class="validation-message">Spouse/partner name is required.</div>'
                                );
                            }

                            // Corporate/company gift
                            if ($("#corporateGift").prop("checked") == true && $("#companyName").val() == "") {
                                errs += "Company name is required.<br/>";
                                $(".companyName-input div").append(
                                    '<div class="validation-message">Company name is required.</div>'
                                );
                            }

                            //Phone
                            // if (!validatePhone(this.donation.Donor.Phone)) {
                            //     errs += "Phone is not valid.<br/>";
                            //     $(".phone-input div").append(
                            //         '<div class="validation-message">Phone number is not valid.</div>'
                            //     );
                            // }

                            if (this.donation.Donor.Phone === "") {
                                
                            } else {
                                if (phoneValid) {

                                } else {
                                    console.log("Phone number not valid");
                                    errs += "Phone is not valid.<br/>";
                                    $(".phone-input").append(
                                        '<div class="validation-message">Phone number is not valid.</div>'
                                    );
                                }
                            }                       
                            
                            // check for at least one designation/amount
                            if (this.donation.Gift.Designations.length < 1) {
                                console.log("Error C");
                                errs += "At least one gift (amount and designation) needs to be added before checking out.<br />";
                                $(".billingInformation .donor").before(
                                    '<div class="validation-message">At least one gift (amount and designation) needs to be added before checking out.</div>'
                                );
                            }
                            
                        }

                        if (step == 3) {
                            /* Validate tribute info */
                            if (this.donation.giftTribute) {
                                // Honoree
                                // if (!this.donation.Gift.Tribute.TributeDefinition.Type) {
                                //     errs += "Tribute type is required.<br />";
                                //     $(".tribute-type-input").append(
                                //         '<div class="validation-message">Tribute type is required.</div>'
                                //     );
                                // }
                                // First name
                                // if (!this.donation.Gift.Tribute.TributeDefinition.FirstName) {
                                if (document.getElementById("txtTributeFirstName").value === "") { 
                                    errs += "Honoree first name is required.<br />";
                                    $(".tribute-fname-input").append(
                                        '<div class="validation-message">Honoree first name is required.</div>'
                                    );
                                }
                                // Last name
                                // if (!this.donation.Gift.Tribute.TributeDefinition.LastName) {
                                if (document.getElementById("txtTributeLastName").value === "") { 
                                    errs += "Honoree last name is required.<br />";
                                    $(".tribute-lname-input").append(
                                        '<div class="validation-message">Honoree last name is required.</div>'
                                    );
                                }
                                // Type
                                // if (!this.donation.Gift.Tribute.TributeDefinition.Type) {
                                if (document.getElementById("ddlTribute").value === "") { 
                                    errs += "Tribute type is required.<br />";
                                    $(".tribute-type-input").append(
                                        '<div class="validation-message">Tribute type is required.</div>'
                                    );
                                }
                                
                                // Special instructions
                                /*if(!this.donation.Gift.Tribute.TributeDefinition.Description) {
                                    errs += "Special instructions/description required.<br />";
                                    $(".tribute-instr-input").after('<div class="validation-message">Special instructions/description required.</div>');
                                }*/
                            }

                            /* Validate acknowledgee info */
                            if (this.donation.giftAcknowledgee) {
                                // Message recipient (acknowledgee)
                                /*if(!$("#txtTributeAcknFullName").val()) {
                                    errs += "Message recipient is required.<br />";
                                }*/
                                // First name
                                /*if(!$("#txtAcknowledgeeFirstName").val()) {
                                    errs += "Acknowledgee first name is required.<br />";
                                }*/

                                // Last name
                                // if (!this.donation.Gift.Tribute.Acknowledgee.LastName) {
                                if (document.getElementById("txtAcknowledgeeLastName").value === "") { 
                                    errs += "Acknowledgee last name is required.<br />";
                                    $(".ackn-lname-input").append(
                                        '<div class="validation-message">Acknowledgee last name is required.</div>'
                                    );
                                }

                                // Street address
                                // if (!this.donation.Gift.Tribute.Acknowledgee.AddressLines) {
                                if (document.getElementById("acknowledgeeStreetAddress").value === "") { 
                                    errs += "Acknowledgee street address is required.<br />";
                                    $(".ackn-address-input").append(
                                        '<div class="validation-message">Acknowledgee street address is required.</div>'
                                    );
                                }

                                // City
                                // if (!this.donation.Gift.Tribute.Acknowledgee.City) {
                                if (document.getElementById("acknowledgeeCity").value === "") { 
                                    errs += "Acknowledgee city is required.<br />";
                                    $(".ackn-city-input").append(
                                        '<div class="validation-message">Acknowledgee city is required.</div>'
                                    );
                                }

                                // ZIP/Postal code
                                // if (!this.donation.Gift.Tribute.Acknowledgee.PostalCode) {
                                if (document.getElementById("acknowledgeePostalCode").value === "") { 
                                    errs += "Acknowledgee ZIP/Postal code is required.<br />";
                                    $(".ackn-zip-input").append(
                                        '<div class="validation-message">Acknowledgee ZIP/Postal code is required.</div>'
                                    );
                                }

                                // State
                                // if (!this.donation.Gift.Tribute.Acknowledgee.State) {
                                if (document.getElementById("acknowledgeeState").value === "") { 
                                    errs += "Acknowledgee state/province is required.<br />";
                                    $(".ackn-state-input").append(
                                        '<div class="validation-message">Acknowledgee state/province is required.</div>'
                                    );
                                }
                                // Country
                                // if (!this.donation.Gift.Tribute.Acknowledgee.Country) {
                                if (document.getElementById("acknowledgeeCountry").value === "") { 
                                    errs += "Acknowledgee country is required.<br />";
                                    $(".ackn-country-input").append(
                                        '<div class="validation-message">Acknowledgee country is required.</div>'
                                    );
                                }

                                //Email Address
                                // if (this.donation.Gift.Tribute.Acknowledgee.Phone != "") {
                                //     if (!validateEmail(this.donation.Gift.Tribute.Acknowledgee.Email)) {
                                //         errs += "Acknowledgee email is not valid.<br/>";
                                //         $(".ackn-email-input").after('<div class="validation-message">Acknowledgee email is not valid.</div>');
                                //     }
                                // }

                                //Phone
                                // if (!validatePhone(this.donation.Gift.Tribute.Acknowledgee.Phone)){
                                //     errs += "Acknowledgee phone is not valid.<br/>";
                                //     $(".ackn-phone-input").after('<div class="validation-message">Acknowledgee phone number is not valid.</div>');
                                // }
                                // if (this.donation.Gift.Tribute.Acknowledgee.Phone === "") {
                                if (document.getElementById("acknowledgeeCountry").value === "") { 
                                
                                } else {
                                    
                                }   

                                // if (acknPhoneValid) { 

                                // } else {
                                //     console.log("Phone number not valid");
                                //     errs += "Phone is not valid.<br/>";
                                //     $(".ackn-phone-input").append(
                                //         '<div class="validation-message">Phone number is not valid.</div>'
                                //     );
                                // }
                            }
                        }
                    }                    

                    if (errs === "") {
                        return true;
                    } else {
                        console.log(errs); //uncommented
                        errs += "<br />";
                        if ($(".validation-message").first()) {
                            $("html, body").animate({
                                    scrollTop: $(".validation-message").first().offset().top - 100
                                },
                                "fast"
                            );
                        } else {
                            $("html, body").animate({
                                    scrollTop: $(".validation").offset().top - 100
                                },
                                "fast"
                            );
                        }

                        return false;
                    }
                };

                GiftSession.prototype.addLineItem = function(
                    amount,
                    designationId,
                    name,
                    descr
                ) {
                    // push a designation/amount pair object into Designations array; also push Name, so that we have the fund name to display
                    if (this.validate(1, amount, designationId, descr)) {
                        var tempObj = {
                            Amount: amount,
                            DesignationId: designationId,
                            Name: name
                        };
                        if (descr.length > 1) {
                            tempObj.Description = descr;
                            tempObj.Name = descr;
                        }

                        //this.donation.Gift.Designations.push({ Amount: amount, DesignationId: designationId, Name: name });
                        this.donation.Gift.Designations.push(tempObj);
                        this.displayLineItems();
                        // stepUpdate(this, 1); // Originally was 2, which made form go to step 2.

                        // Show My Gift section; Show Continue button
                        $("#giftSummary, #cancelAddLineItem").show();

                        // Reset typeahead search field
                        $("#designationSearch").typeahead("val", "");

                        // Reset amounts
                        $(".amounts .amount").removeClass("selected");
                        $("#otherAmtInput").val("");

                        document.getElementById("categoryList").selectedIndex = 0;

                        var fundSelector = document.getElementById("designationId");
                            fundSelector.innerHTML = "";

                        var opt = document.createElement("option");
                        opt.value = "";
                        opt.innerHTML = "Choose a fund";
                        opt.setAttribute("selected", "selected");
                        fundSelector.appendChild(opt);

                        $("#designationSearchCount").text("");

                        // Reset Area to Support field
                        filterDesignations(
                            //"Unrestricted",
                            "999 - Others", // Unit Attribute\Value column
                            "tag",
                            "default"
                            // "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                            //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                        );

                        // Hide College/Unit to support dropdown
                        $(".collegeunit-select, .designation-select, .designationSearch-select").hide();

                        document.getElementById("addLineItem").blur();

                        // $(".designation-description").hide();
                        // $("#desDescrText").text("");
                        // $("#designationDescription").hide();

                        // Scroll down to My Gift section so user can see it
                        // const giftSummaryElement = document.getElementById("cancelAddLineItem");
                        // giftSummaryElement.scrollIntoView(false);

                        // document.getElementById("giftSummary").scrollIntoView({
                        //     behavior: "smooth", // 'auto' or 'smooth'
                        //     block: "start"      // 'start', 'center', 'end', 'nearest'
                        // });

                        setTimeout(function() {
                            if (window.innerWidth < 768) {
                                // Code for mobile devices or small windows
                                scrollToFieldset("giftSummary", 55);
                            } else {
                                // Code for desktop/large screens
                                scrollToFieldset("giftSummary", 55);
                            } 
                        }, 100);
                        
                    }
                    this.giftCount = this.donation.Gift.Designations.length;
                    $(".gift-count").text(this.giftCount);
                    this.update();
                };

                GiftSession.prototype.removeLineItem = function(arrayIndex) {
                    // remove a designation/amount pair object from Designations array
                    // this.donation.Gift.Designations.splice(arrayIndex, 1); the '1' just means how many items to remove.
                    // We could also use this, or something similar, to remove all line items.

                    if (this.donation.Gift.Designations[arrayIndex] !== undefined) {
                        this.donation.Gift.Designations.splice(arrayIndex, 1);
                    }
                    this.displayLineItems();
                    this.giftCount = this.donation.Gift.Designations.length;
                    $(".gift-count").text(this.giftCount);
                    this.update();
                };

                GiftSession.prototype.displayLineItems = function() {
                    //$(".lineItems").append("");
                    var giftSession = this;
                    var lineItems = document.getElementById("lineItems");

                    if (this.donation.Gift.Designations.length < 1) {
                        lineItems.style.display = "block";
                        $("#lineItems").html(
                            '<div style="text-align:center;"><p class="no-gifts">Your gift cart is currently empty.</p></div>'
                            // '<div style="text-align:center;"><p>Your gift cart is currently empty.</p><p class="p-1"><a href="#" class="add-gift">+ Add a gift</a></p></div>'
                        );

                        // $(".add-gift").on("click", function() {
                        //     // If a designation is passed in the URL, load that, else load default
                        //     if (urlSearch) {
                        //         // updateCategories("search");
                        //         filterDesignations(urlSearch, "search");
                        //     } else if (des) {
                        //         // updateCategories("search");
                        //         filterDesignations(des, "search");
                        //     } else {
                        //         filterDesignations(
                        //             //"Unrestricted",
                        //             "999 - Others",
                        //             "tag",
                        //             "default"
                        //             // "bec20fdc-0e79-42ae-b353-b5b46c02f73e"
                        //             // "d68341c5-71e8-4362-b8ab-1ecb3b192432"
                        //         );
                        //         setCategories("default");
                        //         console.log("setCategories A location");
                        //     }
                        //     stepUpdate(giftSession, 1);
                        // });
                        return;
                    } else {
                        lineItems.innerHTML = "<h3>Gifts</h3>";
                    }
                    var giftTotal = 0;

                    for (var i = 0; i < this.donation.Gift.Designations.length; i++) {
                        var lineItem = document.createElement("div");
                        lineItem.id = "lineItem" + (i + 1);
                        lineItem.className = "line-item";

                        // create amount div
                        var lineItemAmount = document.createElement("div");
                        lineItemAmount.className = "line-item-amount";

                        // check if recurring donation and recurrence option to amount div
                        if (this.donation.giftRecurrence) {
                            var lineItemAmountText = document.createTextNode(
                                "$" +
                                Number(this.donation.Gift.Designations[i].Amount).formatMoney(2, ".", ",") +
                                " " +
                                $("#frequency option:selected").text()
                            );
                        } else {
                            var lineItemAmountText = document.createTextNode(
                                "$" +
                                Number(this.donation.Gift.Designations[i].Amount).formatMoney(2, ".", ",")
                            );
                        }

                        // create fund-amount div with input inside; this is hidden from page.
                        var divFundAmount = document.createElement("div");
                        divFundAmount.className = "fund-amount";
                        divFundAmount.style.display = "none";

                        var fundAmountInput = document.createElement("input");
                        fundAmountInput.type = "text";
                        fundAmountInput.value = parseFloat(this.donation.Gift.Designations[i].Amount).toFixed(2);
                        divFundAmount.appendChild(fundAmountInput);    
                        
                        lineItem.appendChild(divFundAmount);

                        // create input 
                        var lineItemInput = document.createElement("input");
                        lineItemInput.id = "lineItemInput" + (i + 1);
                        lineItemInput.setAttribute("data-index", i);
                        lineItemInput.className = "amount";
                        lineItemInput.inputMode = "decimal";
                        lineItemInput.pattern = "[0-9]*";
                        lineItemInput.ariaLabel = "Edit gift amount";
                        lineItemInput.type = "text";
                        lineItemInput.value = Number(this.donation.Gift.Designations[i].Amount).formatMoney(2, ".", ",");

                        lineItemAmount.appendChild(lineItemInput);
                        // lineItemAmount.appendChild(lineItemAmountText);
                        lineItem.appendChild(lineItemAmount);

                        // create name div
                        var lineItemName = document.createElement("div");
                        lineItemName.className = "line-item-name";
                        lineItemName.setAttribute("data-guid", this.donation.Gift.Designations[i].DesignationId);
                        var lineItemNameText = document.createTextNode(
                            this.donation.Gift.Designations[i].Name
                        );
                        lineItemName.appendChild(lineItemNameText);
                        lineItem.appendChild(lineItemName);

                        // create edit & remove buttons
                        var lineItemButtons = document.createElement("div");
                        lineItemButtons.className = "line-item-buttons";

                        /* var lineItemEditButton = document.createElement("a");
                        lineItemEditButton.className = "line-item-edit";
                        lineItemEditButton.setAttribute("data-index", i);
                        var lineItemEditButtonText = document.createTextNode("Edit");
                        lineItemEditButton.appendChild(lineItemEditButtonText);
                        lineItemButtons.appendChild(lineItemEditButton); */

                        var lineItemRemoveButton = document.createElement("a");
                        lineItemRemoveButton.className = "line-item-remove";
                        lineItemRemoveButton.setAttribute("data-index", i);
                        var lineItemRemoveButtonText = document.createTextNode("x Remove");
                        lineItemRemoveButton.appendChild(lineItemRemoveButtonText);
                        lineItemButtons.appendChild(lineItemRemoveButton);
                        lineItem.appendChild(lineItemButtons);

                        // add line item to line-items section and show section
                        lineItems.appendChild(lineItem);

                        // GIFT SUMMARY SECTION
                        var summaryLineItem = document.createElement("div");
                        summaryLineItem.id = "summaryLineItem" + (i + 1);
                        summaryLineItem.className = "line-item";

                        // create amount div
                        var summaryLineItemAmount = document.createElement("div");
                        summaryLineItemAmount.className = "line-item-amount";

                        // check if recurring donation and recurrence option to amount div
                        if (this.donation.giftRecurrence) {
                            var summaryLineItemAmountText = document.createTextNode(
                                "$" +
                                Number(this.donation.Gift.Designations[i].Amount).formatMoney(2, ".", ",") +
                                " " +
                                $("#frequency option:selected").text()
                            );
                        } else {
                            var summaryLineItemAmountText = document.createTextNode(
                                "$" +
                                Number(this.donation.Gift.Designations[i].Amount).formatMoney(2, ".", ",")
                            );
                        }

                        summaryLineItemAmount.appendChild(summaryLineItemAmountText);
                        summaryLineItem.appendChild(summaryLineItemAmount);

                        // create name div
                        var summaryLineItemName = document.createElement("div");
                        summaryLineItemName.className = "line-item-name";
                        var summaryLineItemNameText = document.createTextNode(
                            this.donation.Gift.Designations[i].Name
                        );
                        summaryLineItemName.appendChild(summaryLineItemNameText);
                        summaryLineItem.appendChild(summaryLineItemName);

                        // create edit & remove buttons
                        var summaryLineItemButtons = document.createElement("div");
                        summaryLineItemButtons.className = "line-item-buttons";

                        var summaryLineItemRemoveButton = document.createElement("a");
                        summaryLineItemRemoveButton.className = "line-item-remove";
                        summaryLineItemRemoveButton.setAttribute("data-index", i);
                        var summaryLineItemRemoveButtonText = document.createTextNode("x Remove");
                        summaryLineItemRemoveButton.appendChild(summaryLineItemRemoveButtonText);
                        summaryLineItemButtons.appendChild(summaryLineItemRemoveButton);
                        summaryLineItem.appendChild(summaryLineItemButtons);

                        // add line item to line-items section and show section
                        giftTotal += Number(this.donation.Gift.Designations[i].Amount);                        

                        if ($(".payrollDeduction").length !== 0) {
                            $("#totalGift").val("$" + giftTotal.formatMoney(2, ".", ","));
                        } else {
                            // do nothing
                        }
                    }

                    if (this.donation.giftRecurrence) {
                        $("#lineItems").append(
                            '<div class="line-item total">Total: $' + giftTotal.formatMoney(2, ".", ",") + ' ' + $("#frequency option:selected").text().trim() + '</div>'
                        );
                    } else {
                        $("#lineItems").append(
                            '<div class="line-item total">Total: $' + giftTotal.formatMoney(2, ".", ",") + '</div>'
                        );

                        // Set text for Button to donate amount shown
                        // var donateButton = document.getElementById("donate");
                        // donateButton.value = "Donate $" + giftTotal.formatMoney(2, ".", ",");
                    }

                    // $("#lineItems").append(
                    //     '<div class="line-item total">Total: $' +
                    //     giftTotal.formatMoney(2, ".", ",") +
                    //     "</div>"
                    // );

                    if ($('#donation-form.payroll').length !== 0) {
                        // $("#numberOfInstallments, #installmentAmount").val("");
                        document.getElementById("numberOfInstallments").value = 1;
                        $("#totalGift, #installmentAmount").val("$" + giftTotal.formatMoney(2, ".", ","));
                    } else {
                        // do nothing
                    }

                    // Put "add another gift" link at the bottom, which can probably just go to previous step
                    if (
                        // $("#recurringGift").prop("checked") != true &&
                        // $("#giftType").val() != "Monthly" &&
                        $(".gift-type a#Monthly:not(.selected)") && this.donation.Gift.Designations.length > 0
                    ) {
                        $("#lineItems").append(
                            '<div class="text-center"><a href="#giftDetails" id="scrollLink" class="add-gift link">+ Add another gift</a></div>'
                        );
                    } else {}

                    // $(".add-gift").on("click", function(e) {
                    //     // If a designation is passed in the URL, load that, else load default
                    //     e.preventDefault();
                    //     if (urlSearch) {
                    //         // updateCategories("search");
                    //         filterDesignations(urlSearch, "search");
                    //     } else if (des) {
                    //         // updateCategories("search");
                    //         filterDesignations(des, "search");
                    //     } else {
                    //         filterDesignations(
                    //             //"Unrestricted",
                    //             "999 - Others", // Unit Attribute\Value column
                    //             "tag",
                    //             "default"
                    //             // "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                    //             //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                    //         );
                    //         // updateCategories("school");
                    //         // setCategories("default");
                    //         console.log("setCategories B location");
                    //     }
                    //     $("#addLineItem").show();

                    //     stepUpdate(giftSession, 1);
                    // });
                    
                    $(".line-item-remove").on("click", function(e) {
                        giftSession.removeLineItem(e.target.getAttribute("data-index"));
                        // if (
                        //     // $("#recurringGift").prop("checked") == true &&
                        //     // $("#giftType").val() == "Monthly" &&
                        //     $(".gift-type a#Monthly").hasClass("selected") && myGift.donation.Gift.Designations.length < 1
                        // )
                        if ($(".gift-type a#Monthly").hasClass("selected") && myGift.donation.Gift.Designations.length < 1) {
                            // $("#returnToGiftDetail").show(); // original code but removed for new process
                            $("#cancelAddLineItem").hide();
                            const target = document.getElementById('giftDetails');
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else if(myGift.donation.Gift.Designations.length != 0) {
                            $("#cancelAddLineItem").show();
                        } else {
                            $("#cancelAddLineItem").hide();
                            $("#addLineItem").show();
                            const target = document.getElementById('giftDetails');
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });

                    $(".line-item-amount input").on("focus", function(e) {
                        e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                    });

                    $(".line-item-amount input").on("blur", function(e) {
                        e.preventDefault();
                        var amountField = this.parentNode.parentNode.getElementsByClassName("fund-amount")[0].firstChild;

                        var val = this.value;

                        if (Number(val) < 5.00) {
                            // If under $5, return amount back to previous value
                            // Add alert message, reminding user of minimum amount.
                            alert("Please enter a minimum of $5.");
                            this.value = amountField.value;
                        } else {    
                            if (isNaN(val)) {
                                // console.log(isNaN(val));
                                val = val.replace(/[^0-9\.]/g, '');
                                if (val.split('.').length > 2) {
                                    val = val.replace(/\.+$/, "");
                                }
                            }   
                            var numVal = parseFloat(val).toFixed(2);
                            this.value = numberWithCommas(val);
                            amountField.value = (isNaN(numVal) ? "0.00" : numVal);
                            
                            giftSession.updateLineItem(e.target.getAttribute("data-index"), amountField.value);
                        }
                    });

                    document.getElementById('scrollLink').addEventListener('click', function(event) {
                        // Prevent the default "jump" behavior
                        event.preventDefault();
                        
                        // Find the fieldset by its ID
                        const target = document.getElementById('giftDetails');
                        
                        // Scroll to the top of the fieldset smoothly
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                };

                GiftSession.prototype.updateLineItem = function(arrayIndex, amountChanged) {
                    // console.log(arrayIndex);
                    // console.log(amountChanged);
                    
                    let dataArray = this.donation.Gift.Designations;

                    const keyToUpdate = "Amount";
                    const newAmount = amountChanged;
                    dataArray[arrayIndex] = { ...dataArray[arrayIndex], [keyToUpdate]: newAmount };

                    // console.log(this.donation.Gift.Designations[arrayIndex]);

                    this.displayLineItems();
                    this.update();
                };
                /* End GiftSession functions */

                // Create an instance of the DonationService
                var ds = new BLACKBAUD.api.DonationService($(".BBDonationApiContainer").data("partid")),
                    //ClientSitesID = $(".BBDonationApiContainer").attr("ClientSitesID"),
                    CheckoutModel = JSON.parse(checkoutData),
                    serverMonth = $(".BBDonationApiContainer").attr("serverMonth") - 1,
                    serverDay = $(".BBDonationApiContainer").attr("serverDay"),
                    serverYear = $(".BBDonationApiContainer").attr("serverYear"),
                    ServerDate = new Date(serverYear, serverMonth, serverDay);
                InitializeBBCheckout();

                // Create our success handler
                var success = function(returnedDonation) {
                    console.log(returnedDonation); // uncommented
                };

                // Create our error handler
                var error = function(returnedErrors) {
                    console.log("Error!"); // uncommented
                    setValidationMessage(convertErrorsToHtml(error));
                };

                //Checkout Payment popup is loaded in this form.
                if ($('form[data-formtype="bbCheckout"]').length <= 0) {
                    var form =
                        "<form method='get' id=\"paymentForm\" data-formtype='bbCheckout' data-disable-submit='false' novalidate></form>";
                    $("body").append(form);
                }

                $("#paymentForm").submit(function paymentComplete(e) {
                    // prevent form from refreshing and show the transaction token
                    e.preventDefault();
                });
                var SrtDt,
                    publicKey,
                    donationData,
                    EditorContent,
                    ServerDate,
                    checkoutGenericError =
                    "There was an error while performing the operation.The page will be refreshed";

                // Get data part data and public key for checkout
                getCountries(); // Commented out for now while testing Mabox by switching to text box instead.
                //getDesignations();

                var blocked = false; // To block the form from being used while Query API is loading data

                // global array for designations
                //var designationArray = [];

                //#region CCCheckoutPayment
                //return which payment method is selected on the page
                function GetPaymentType() {
                    // paymentMethod = $("[name='paymentMethod']:checked").val();
                    //return paymentMethod;
                    if ($('#donation-form.payroll').length !== 0) {
                        // console.log("payroll here!");
                        paymentMethod = 1;
                    } else {
                        // console.log("cc here!");
                        paymentMethod = 0;
                    }
                    // return 0;
                    return paymentMethod;
                }

                // get all URL vars by URL
                function getUrlVars(url) {
                    var vars = [],
                        hash;
                    var hashes = url.slice(url.indexOf("?") + 1).split("&");
                    for (var i = 0; i < hashes.length; i++) {
                        hash = hashes[i].split("=");
                        vars.push(hash[0]);
                        vars[hash[0]] = hash[1];
                    }
                    return vars;
                }

                // get a specific URL var by name
                function getURLParameter(name) {
                    return (
                        decodeURIComponent(
                            (new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(
                                location.search
                            ) || [, ""])[1].replace(/\+/g, "%20")
                        ) || null
                    );
                }

                function getUrlValues() {
                    // Get values from URL parameters
                    sourceCode = getURLParameter("sourcecode");
                    finderNumber = getURLParameter("efndnum");
                    cat = getURLParameter("cat");
                    subcat = getURLParameter("subcat");
                    des = getURLParameter("des");
                    urlAmount = getURLParameter("amt");
                    urlSearch = getURLParameter("search");
                    recurring = getURLParameter("recurring");
                    pledge = getURLParameter("pledge");
                    pledgeId = getURLParameter("pledgeId");
                    pledgeAmt = getURLParameter("pledgeAmt");
                    hideack = getURLParameter("hideack");
                    funderTransactionId = getURLParameter("transid");
                    urlDesignationGuid = getURLParameter("id");
                    area = getURLParameter("area");
                    unit = getURLParameter("unit");

                    if (urlDesignationGuid && !urlSearch) urlSearch = urlDesignationGuid;

                    if (recurring) {
                        $(".gift-type a#One-Time").removeClass("selected");
                        $(".gift-type a#Pledge").removeClass("selected");
                        // $("#recurringGift").prop("checked", true);
                        $(".gift-type a#Monthly").addClass("selected");
                        // recurringHandler();
                        // populateStartDate();
                    }
                    if (pledge) {
                        $(".gift-type a#One-Time").removeClass("selected");
                        $(".gift-type a#Monthly").removeClass("selected");
                        $(".gift-type a#Pledge").addClass("selected");
                        // recurringHandler();
                        if (pledgeId) {
                            $("#pledgeId").val(pledgeId);
                        }
                        if (pledgeId) {
                            $("#pledgeAmount").val(pledgeAmt);
                        }
                    }
                    if (hideack) {
                        $("#chkAcknowledge").parent().css("display", "none");
                        $("#acknowledgeeInfoSub").css("display", "none");
                        //recurringHandler();
                    }
                    recurringHandler();
                    if (urlSearch) {
                        // Change dropdown to "Search fund by name" option. Trigger update.
                        let dropdown = document.getElementById("categoryList");
                        // dropdown.value = "search fund by name";
                        dropdown.selectedIndex = 5;
                        
                        // console.log("urlSearch");
                        // updateCategories("search");
                        $("#designationSearch").typeahead("val", urlSearch);
                        //filterDesignations(urlSearch, "search");  // move to querySuccess function.  Designations not yet loaded here.
                    } else if (des) {
                        // updateCategories("search");
                        $("#designationSearch").typeahead("val", des);
                        // $("#designationSearch").val(des);
                    } else {

                    }

                    if (area) {
                        console.log(area.toLowerCase());
                    }

                    if (urlAmount) {
                        urlAmount = parseFloat(Math.round(urlAmount * 100) / 100).toFixed(2); // restrict to 2 decimal places, for display purposes
                        $("#otherAmtInput").val(urlAmount);

                        $("a.amount").each(function() {
                            let btnAmount = parseFloat(Math.round($(this).attr("data-value") * 100) / 100).toFixed(2);
                            if (urlAmount === btnAmount) {
                                $(".amounts a, .amounts .otherAmt, .amounts input").removeClass("selected");				
                                $(this).addClass("selected");
                            } else {
                                $("label.otherAmt").addClass("selected");
                                $("input#otherAmtInput").addClass("selected");
                            }
                        });
                    }
                }

                //this is the function that calls the payment api to open the checkout pop up with all the parameters
                // this.makePayment = function () {
                function makePayment() {
                    //opened = false;
                    //var checkout = new SecureCheckout(handleCheckoutComplete, handleCheckoutError, handleCheckoutCancelled, handleCheckoutLoaded);
                    var donor = data.Donor;
                    var selectedCountry = $("#country :selected").attr("value");
                    var selectedState = $("#state :selected").attr("value");
                    var selectedProvidence = $("#providence :selected").attr("value");
                    if (selectedCountry && selectedCountry.toLowerCase() == "gb") {
                        selectedCountry = "UK";
                    }
                    // get total amount from gift object
                    var totalAmount = 0;

                    for (var i = 0; i < myGift.donation.Gift.Designations.length; i++) {
                        totalAmount += Number(myGift.donation.Gift.Designations[i].Amount);
                    }

                    bbcheckout.Configuration.Data.Amount = totalAmount;
                    bbcheckout.Configuration.Data.BillingAddressCity = donor.Address.City;
                    bbcheckout.Configuration.Data.BillingAddressCountry = selectedCountry;
                    bbcheckout.Configuration.Data.BillingAddressLine = donor.Address.StreetAddress;
                    bbcheckout.Configuration.Data.BillingAddressPostCode = donor.Address.PostalCode;
                    bbcheckout.Configuration.Data.BillingAddressState = selectedState;
                    bbcheckout.Configuration.Data.BillingAddressEmail = donor.EmailAddress;
                    bbcheckout.Configuration.Data.BillingAddressFirstName = donor.FirstName + " " + (donor.MiddleName ? donor.MiddleName : "");
                    bbcheckout.Configuration.Data.BillingAddressLastName = donor.LastName;
                    bbcheckout.Configuration.Data.Cardholder = donor.FirstName + " " + donor.LastName;
                    bbcheckout.Configuration.Data.UseVisaCheckout = data.Gift && !data.Gift.Recurrence;
                    bbcheckout.Configuration.Data.UseMasterpass = data.Gift && !data.Gift.Recurrence;
                    bbcheckout.Configuration.Data.UseApplePay = data.Gift && !data.Gift.Recurrence;
                    bbcheckout.Configuration.TransactionType = bbcheckout.TransactionType.Card_Not_Present;
                    bbcheckout.Configuration.Data.CardToken = null;
                    bbcheckout.Configuration.Data.Note = productName;
                    //bbcheckout.Configuration.Data.Description = checkoutDescription;

                    //console.log("donationData...");console.log(donationData);
                    /*if (data.Gift && data.Gift.Recurrence ){
                        bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
                    }*/

                    //check server date and start date here -- if same then make transaction today
                    if (data.Gift && data.Gift.Recurrence && !isProcessNow()) {
                        bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
                        bbcheckout.Configuration.TransactionType =
                            bbcheckout.TransactionType.Store_Card; //Store card transactions
                    } else if (data.Gift && data.Gift.Recurrence) {
                        bbcheckout.Configuration.Data.CardToken = CheckoutModel.DataKey;
                    }

                    //Set Donor Info so that it will be passed to finish the transaction at the end.
                    data.DonationSource = bbcheckout.Configuration.DonationSource.ADF;
                    data.Type = bbcheckout.Configuration.TranType.Donation;
                    bbcheckout.DonorInfo = data;
                    bbcheckout.openCheckout();
                };

                function InitializeBBCheckout() {
                    bbcheckout = new BBCheckoutProcessor(
                        checkoutFunctions(),
                        CheckoutModel.APIControllerName,
                        CheckoutModel.TokenId,
                        '[class*="donationForm"]'
                    );
                    // console.log("bbcheckout.Configuration: " + bbcheckout.Configuration);

                    bbcheckout.Configuration.Data.Key = CheckoutModel.PublicKey;
                    bbcheckout.Configuration.TransactionType = CheckoutModel.TransactionType;
                    bbcheckout.Configuration.Data.ClientAppName = CheckoutModel.ClientAppName;
                    bbcheckout.Configuration.Data.MerchantAccountId =
                        CheckoutModel.MerchantAccountId;
                    bbcheckout.Configuration.Data.IsEmailRequired = CheckoutModel.IsEmailRequired;
                    bbcheckout.Configuration.Data.IsNameVisible = CheckoutModel.IsNameVisible;
                    bbcheckout.Configuration.Data.PrimaryColor = CheckoutModel.PrimaryColor;
                    bbcheckout.Configuration.Data.SecondaryColor = CheckoutModel.SecondaryColor;
                    bbcheckout.Configuration.Data.FontFamily = CheckoutModel.FontFamily;
                    bbcheckout.Configuration.Data.UseCaptcha = CheckoutModel.UseCaptcha;
                    bbcheckout.Configuration.WorkflowType = CheckoutModel.WorkFlowType;
                    bbcheckout.Configuration.HandleBrowserClosing =
                        CheckoutModel.HandleBrowserClosing === true ? "True" : "False";
                    bbcheckout.Configuration.APITokenID = CheckoutModel.TokenId;
                    // You can add your own message to display on screen, after checkout pop-up close
                    bbcheckout.Configuration.TempConfirmationHtml =
                        "Thank you for your gift. Please wait while we process your transaction.";
                    bbcheckout.intializeCheckout();

                    /* Init functions */
                    // create new gift object instance
                    myGift = new GiftSession(0, CheckoutModel.MerchantAccountId);
                    getUrlValues();
                    //recurringHandler();
                    getDesignations();
                    // fundSearchStepped(); 
                }

                function checkoutFunctions() {
                    //  If you don't have anything to do then you don't add any events from below mentioned checkoutEvents
                    checkoutEvents = {
                        checkoutComplete: function(e) {
                            //Place any code if you want to do anything on checkout complete.
                            bbcheckout.postCheckoutFinish();
                            // if (BLACKBAUD.api.pageInformation.rootPath === "https://giveto.uc.edu/") {
                            //     submitAnalytics();
                            // }                            
                            $(".page-title h1").text("Thank you!");
                            $(".bc-payment").removeClass("active").addClass("complete");
                            
                            // console.log(bbcheckout);
                        },
                        checkoutError: function(data) {
                            //Place any code if you want to do anything on error.
                            console.log("checkoutError() called from checkoutFunctions().  Data: ");
                            console.log(data);
                        },
                        checkoutExpired: function() {
                            //Place any code if you want to do anything on Checkout expired.
                        },
                        checkoutReady: function() {
                            // console.log("Ready or not");
                            //Place any code if you want to do anything on Checkout Ready.
                        },
                        browserClose: function() {
                            //Place any code if you want to do anything on Checkout Browser closing.
                        },
                        checkoutCancel: function() {
                            // console.log("Donation cancelled!");                         
                            $(".bc-review").removeClass("complete");
                            if ($('#donation-form.payroll').length !== 0) {
                                stepUpdate(myGift, 4);
                            } else {
                                stepUpdate(myGift, 3);
                            }                            
                            //Place any code if you want to do anything on Checkout cancel.
                        },
                        checkoutLoaded: function() {
                            // console.log("loaded checkout");
                            // var data = {
                            //     'key' : 'cf3cd5cc-43ef-4f89-9170-03c4fc55be61',
                            //     'payment_configuration_id': 'f086c1c9-5512-4386-a9a4-ecc6fe755f64',
                            //     'amount': 10.00,
                            //     'primary_color': '#FF0000',
                            //     'font_family': 'opensans'
                            // };

                            // Blackbaud_OpenPaymentForm(data);                  
                            //Place any code if you want to do anything on Checkout loaded.
                        }
                    };
                    return checkoutEvents;
                }

                //to check for recurring gift that is to be processed today or not (this is check for call stored card payment api)
                function isProcessNow() {
                    var recStartDate = data.Gift.Recurrence.StartDate;
                    var frequency = data.Gift.Recurrence.Frequency;
                    var dayOfMonth = data.Gift.Recurrence.DayOfMonth;
                    var month = data.Gift.Recurrence.Month;
                    var startDateIsTodayDate = false;
                    var recurrentStartDate = new Date(recStartDate);
                    var isProcessedNow = false;
                    var serverDate = new Date(ServerDate);
                    if (
                        recurrentStartDate.getFullYear() === serverDate.getFullYear() &&
                        recurrentStartDate.getMonth() === serverDate.getMonth() &&
                        recurrentStartDate.getDate() === serverDate.getDate()
                    ) {
                        startDateIsTodayDate = true;
                    } else {
                        return false;
                    }

                    //Weekly Frequency
                    /*if (frequency == 1) {
                            isProcessedNow = startDateIsTodayDate && dayOfWeek == serverDate.getDay();
                        }*/
                    //Mothly and Quarterly frequency
                    //else
                    if (frequency == 2 || frequency == 3) {
                        isProcessedNow = startDateIsTodayDate && dayOfMonth == serverDate.getDate();
                    }
                    //Annually frequency
                    else if (frequency == 4) {
                        isProcessedNow =
                            startDateIsTodayDate &&
                            dayOfMonth == serverDate.getDate() &&
                            month == serverDate.getMonth() + 1;
                    }
                    //Every 4 weeks
                    else if (frequency == 7) {
                        isProcessedNow = startDateIsTodayDate;
                    } else {
                        isProcessedNow = false;
                    }
                    return isProcessedNow;
                }

                function setValidationMessage(html) {
                    $(".validation").html(html);
                }

                function setConsentValidationMessage(html) {
                    $(".consentValidation").html(html);
                }

                // Extract the data entered by the user and fill the result object for transaction processing.
                function extractDataFromForm() {
                    var paymentMethod,
                        result,
                        organizationName = "",
                        consentOptions,
                        solicitCodeCount;
                    
                    paymentMethod = 1;
                    result = {};
                    // Donor information
                    result.Donor = {
                        Title: $("#personalTitle").val().trim(),
                        FirstName: $("#firstName").val().trim(),
                        LastName: $("#lastName").val(),
                        EmailAddress: $("#emailAddress").val(),
                        Phone: $("#phone").val(),
                        Address: {
                            Country: $("#country").val(),
                            State: $("#state").val(),
                            City: $("#city").val(),
                            StreetAddress: $("#streetAddress").val(),
                            PostalCode: $("#postalCode").val()
                        },
                        // OrganizationName: organizationName
                    };

                    const giftDesignationsArray = [];
                    const lineItemsData = [];

                    document.querySelectorAll('.line-item:not(.total)').forEach(item => {
                        const amountInput = item.querySelector('.amount');
                        const amount = amountInput ? amountInput.value : null;

                        const nameDiv = item.querySelector('.line-item-name');
                        const designationId = nameDiv ? nameDiv.getAttribute('data-guid') : null;

                        const name = nameDiv ? nameDiv.textContent.trim() : null;

                        lineItemsData.push({
                            Amount: amount,
                            DesignationId: designationId,
                            Name: name
                        });
                    });

                    giftDesignationsArray.push(lineItemsData);

                    function dateNow(splinter) {
                        var set = new Date($('#startMonth').val());
                        var getDate = set.getDate().toString();
                        // if (getDate.length == 1) { //example if 1 change to 01
                        //     getDate = "0" + getDate;
                        // }
                        var getMonth = (set.getMonth() + 1).toString();
                        // if (getMonth.length == 1) {
                        //     getMonth = "0" + getMonth;
                        // }
                        var getYear = set.getFullYear().toString();
                        var dateNow = getMonth + splinter + getDate + splinter + getYear; //today
                        return dateNow;
                    }

                    // field variables
                    var frequency = $("#frequency").find("input[name='pay_period']:checked").val(),
                        // startDate = new Date($('#pledgeStartDate').attr('data-date')),
                        startDate = new Date($('#startMonth').val()),
                        // endDate = new Date($('#pledgeEndDate').val().replace(/-/g, '\/')),
                        endDate = '',
                        dayOfMonth = startDate.getDate(),
                        dayOfWeek = startDate.getDay(),
                        month = startDate.getMonth() + 1,
                        year = startDate.getYear();

                    
                    const dateString = document.getElementById("startMonth").value;
                    const monthValue = dateString.split(" ")[0]; 
                    const yearValue = dateString.split(" ")[1]; 
                    let monthNameValue;

                    switch (monthValue) {
                        case "January":
                            monthNameValue = "01";
                            break;
                        case "February":
                            monthNameValue = "02";
                            break;
                        case "March":
                            monthNameValue = "03";
                            break;
                        case "April":
                            monthNameValue = "04";
                            break;
                        case "May":
                            monthNameValue = "05";
                            break;
                        case "June":
                            monthNameValue = "06";
                            break;
                        case "July":
                            monthNameValue = "07";
                            break;
                        case "August":
                            monthNameValue = "08";
                            break;
                        case "September":
                            monthNameValue = "09";
                            break;
                        case "October":
                            monthNameValue = "10";
                            break;
                        case "November":
                            monthNameValue = "11";
                            break;
                        case "December":
                            monthNameValue = "12";
                            break;
                        default:
                        monthNameValue = "Invalid Month"; // Handles numbers outside 1-12
                    }

                    function removeZeroUnlessTen(val) {
                        // Converts to a string, then removes all '0' characters unless the exact string is "10"
                        const str = String(val);
                        return str === "10" ? str : str.replace(/0/g, "");
                    }

                    // removeZeroUnlessTen(monthNameValue)

                    // const newMonthValue = monthNameValue.replaceAll("0", "");

                    const payrollDeductionStartDateValue = removeZeroUnlessTen(monthNameValue) + "/1/" + yearValue;
                    const formattedDate = yearValue + "-" + monthNameValue + "-01T04:00:00.000Z"; 
                    console.log(formattedDate);
                    // "2026-07-01T04:00:00.000Z" 

                    result.Gift = {
                        PaymentMethod: 1,
                        // PledgeInstallment: {
                        //     NumberOfInstallments: parseInt(document.getElementById("numberOfInstallments").value),
                        //     InstallmentAmount: $('#installmentAmount').val().replace('$', '').replace(',', '')
                        // },
                        Attributes: [{
                            AttributeId: "44b0f3c0-c4d6-4343-8355-943fb4703990",
                            Value: document.getElementById('state').value
                        },
                        {
                            AttributeId: "cca52f5c-97eb-4a5d-b3ac-4d7ed9b036a4",
                            Value: $('#country option:selected').text()
                        },
                        {
                            AttributeId: "126739cb-50c9-4f1f-8c69-31a5625cbb3f",
                            Value: $('#employerName option:selected').text()
                        },
                        {
                            AttributeId: "e27106ea-1e71-42ba-9903-33cd6913613f",
                            Value: $("input[name='pay_period']:checked").val()
                        },
                        {
                            AttributeId: "e93b3b57-4cee-4ac9-ac9a-20a7736d5bb8",
                            Value: document.getElementById("anonymousCheckbox").checked ? "Yes" : "No"
                        },
                        {
                            AttributeId: "d3b28f46-5db5-4e83-8d40-42313da72d42",
                            Value: document.getElementById('employeeID').value
                        },
                        {
                            AttributeId: "88d9ba6c-37e9-43ef-ade2-136b76869e30",
                            Value: document.getElementById('startWhenCompleted').checked ? 'Y' : 'N'
                        },
                        {
                            AttributeId: "196d3998-dfa3-4102-9509-f054f9108aad",
                            Value: payrollDeductionStartDateValue // dateNow("/")
                        }],
                        // FinderNumber: $("#finderNumber").val(),
                        // Comments: "",
                        IsAnonymous: false,
                        PledgeInstallment: {
                            NumberOfInstallments: document.getElementById('numberOfInstallments').value,
                            InstallmentAmount: document.getElementById('installmentAmount').value
                        },
                        Recurrence: {
                            DayOfMonth: 1,
                            Frequency: 2,
                            // StartDate: firstOfMonthISO + "T04:00:00.000Z",
                            // StartDate: "2026-07-01T04:00:00.000Z",
                            StartDate: formattedDate, // "2026-07-01T04:00:00.000Z", 
                            EndDate: ""
                        }
                    };

                    // Anonymous
                    // if ($("#anonymousCheckbox:checked").length !== 0) {
                    //     result.Gift.IsAnonymous = true;
                    // } else {
                    //     result.Gift.IsAnonymous = false;
                    // }

                    // if ($("#anonymousCheckbox:checked").length !== 0) {
                    //     result.Gift.IsAnonymous = true;
                    // }

                    // if ($("#anonymousCheckbox:checked").length !== 0) {
                    //     // Anonymous Gift?
                    //     var anonymousGiftSelected = {
                    //         AttributeId: BBI.Defaults.anonymousGift,
                    //         Value: "Yes"
                    //     };
                    //     result.Gift.Attributes.push(anonymousGiftSelected);
                    // } else {
                    //     var anonymousGiftSelected = {
                    //         AttributeId: BBI.Defaults.anonymousGift,
                    //         Value: "No"
                    //     };
                    //     result.Gift.Attributes.push(anonymousGiftSelected);
                    // }                    

                    // CUSTOM ATTRIBUTES
                    // List
                        // Number of pay periods ✅
                        // Installment amount ✅
                        // Pay period to start deductions
                        // Payroll deduction frequency
                        // Payroll deduction start after current pledge.

                        // M#/Employee ID ✅
                        // Primary employer ✅
                        // Joint gift ✅

                    var numberOfInstallments = parseInt($('#numberOfInstallments').val());
                    if (numberOfInstallments) {
                        var giftAmount = $("#totalGift").val().replace("$", "").replace(",", "");

                        //Amount has been hardcoded to 500. Replace the value with a value entered by user.
                        // var installmentAmount = donationService.getRecurringGiftInstallmentAmount(giftAmount, numberOfInstallments);

                        result.Gift.PledgeInstallment = {
                            NumberOfInstallments: parseInt(document.getElementById("numberOfInstallments").value),
                            InstallmentAmount: $('#installmentAmount').val().replace('$', '').replace(',', '')
                        }
                    }

                    // var numberOfInstallments = parseInt(document.getElementById("numberOfInstallments").value);
                    // if (numberOfInstallments) {
                    //     var giftAmount = $("#totalGift").val().replace("$", "").replace(",", "");

                    //     //Amount has been hardcoded to 500. Replace the value with a value entered by user.
                    //     var installmentAmount = ds.getRecurringGiftInstallmentAmount(giftAmount, numberOfInstallments);

                    //     // result.Gift.PledgeInstallment = {
                    //     const pledgeInstallmentValues = {
                    //         NumberOfInstallments: numberOfInstallments,
                    //         InstallmentAmount: installmentAmount
                    //     }
                    //     result.Gift.PledgeInstallment = pledgeInstallmentValues;
                    // }

                    /*
                    const pledgeInstallmentArray = null;
                    const pledgeInstallmentDataArray = [];

                    document.querySelectorAll('.payrollInformation').forEach(item => {
                        const numberOfInstallmentsInput = item.querySelector('.numberOfInstallments');
                        const numberOfInstallments = numberOfInstallmentsInput ? numberOfInstallmentsInput.value : null;

                        var giftAmount = $("#totalGift").val().replace("$", "").replace(",", "");

                        var installmentAmount = ds.getRecurringGiftInstallmentAmount(giftAmount, parseInt(numberOfInstallments));

                        result.Gift.PledgeInstallment = {
                            NumberOfInstallments: parseInt(numberOfInstallments),
                            InstallmentAmount: Number(parseFloat(installmentAmount).toFixed(2))              
                        };
                    }); */

                    // pledgeInstallmentArray.push(pledgeInstallmentDataArray);
                    // console.log("pledgeInstallmentArray");
                    // console.log(pledgeInstallmentArray);

                    // var pledgeInstallmentData;

                    // var numberOfInstallments = parseInt($('#numberOfInstallments').val());
                    // if (numberOfInstallments) {
                    //     var giftAmount = $("#totalGift").val().replace("$", "").replace(",", "");

                    //     var installmentAmount = ds.getRecurringGiftInstallmentAmount(giftAmount, numberOfInstallments);

                    //     result.Gift.PledgeInstallment = { 
                    //         NumberOfInstallments: parseInt(numberOfInstallments),
                    //         InstallmentAmount: Number(parseFloat(installmentAmount).toFixed(2))
                    //     } 
                    // }

                    // Get frequency value
                    // var frequencyValue = $(".payrollInformation").find("input[name='pay_period']:checked").val();
                    // console.log(frequencyValue);

                    // if (frequencyValue) {
                    //     // The following fields are always required
                    //     // donation.Gift.Recurrence = {
                    //     // 	Frequency: $("#frequency").find("input[name='pay_period']:checked").val(),
                    //     // 	StartDate: $('#startMonth').val(),
                    //     // 	DayOfMonth: 1
                    //     // };

                    //     console.log();

                    //     function dateNow(splinter) {
                    //         var set = new Date($('#startMonth').val());
                    //         var getDate = set.getDate().toString();
                    //         // if (getDate.length == 1) { //example if 1 change to 01
                    //         //     getDate = "0" + getDate;
                    //         // }
                    //         var getMonth = (set.getMonth() + 1).toString();
                    //         if (getMonth.length == 1) {
                    //             getMonth = "0" + getMonth;
                    //         }
                    //         var getYear = set.getFullYear().toString();
                    //         var dateNow = getMonth + splinter + getDate + splinter + getYear; //today
                    //         return dateNow;
                    //     }

                    //     // field variables
                    //     var frequency = $("#frequency").find("input[name='pay_period']:checked").val(),
                    //         // startDate = new Date($('#pledgeStartDate').attr('data-date')),
                    //         startDate = new Date($('#startMonth').val()),
                    //         // endDate = new Date($('#pledgeEndDate').val().replace(/-/g, '\/')),
                    //         endDate = '',
                    //         dayOfMonth = startDate.getDate(),
                    //         dayOfWeek = startDate.getDay(),
                    //         month = startDate.getMonth() + 1,
                    //         year = startDate.getYear();

                    //     var lastday = function(y, m) {
                    //         return new Date(y, m, 0).getDate();
                    //     }

                    //     var lastDayOfMonth = lastday(year, month);
                    //     // year = year.split(" ")[1]
                    //     console.log(dateNow("/"));

                    //     /* monthly, quarterly, or annually */
                    //     if (frequency) {
                    //         result.Gift.Recurrence = {
                    //             DayOfMonth: 1, // lastDayOfMonth,
                    //             Frequency: 2,
                    //             StartDate: startDate,
                    //             EndDate: endDate,
                    //         };
                    //     }

                    //     var payrollDeductionStartDate = {
                    //         AttributeId: BBI.Defaults.payrollDeductionStartDate,
                    //         Value: dateNow("/")
                    //     };
                    //     result.Gift.Attributes.push(payrollDeductionStartDate);
                        
                    // }

                    // function dateNow(splinter) {
                    //     var set = new Date($('#startMonth').val());
                    //     var getDate = set.getDate().toString();
                    //     // if (getDate.length == 1) { //example if 1 change to 01
                    //     //     getDate = "0" + getDate;
                    //     // }
                    //     var getMonth = (set.getMonth() + 1).toString();
                    //     if (getMonth.length == 1) {
                    //         getMonth = "0" + getMonth;
                    //     }
                    //     var getYear = set.getFullYear().toString();
                    //     var dateNow = getMonth + splinter + getDate + splinter + getYear; //today
                    //     return dateNow;
                    // }

                    // // field variables
                    // var frequency = $("#frequency").find("input[name='pay_period']:checked").val(),
                    //     // startDate = new Date($('#pledgeStartDate').attr('data-date')),
                    //     startDate = new Date($('#startMonth').val()),
                    //     // endDate = new Date($('#pledgeEndDate').val().replace(/-/g, '\/')),
                    //     endDate = '',
                    //     dayOfMonth = startDate.getDate(),
                    //     dayOfWeek = startDate.getDay(),
                    //     month = startDate.getMonth() + 1,
                    //     year = startDate.getYear();

                    // var lastday = function(y, m) {
                    //     return new Date(y, m, 0).getDate();
                    // }

                    // var lastDayOfMonth = lastday(year, month);
                    // // year = year.split(" ")[1]
                    // console.log(dateNow("/"));

                    // if (frequency) {
                    //     result.Gift.Recurrence = {
                    //         DayOfMonth: 1, // lastDayOfMonth,
                    //         Frequency: 2,
                    //         StartDate: startDate,
                    //         EndDate: endDate,
                    //     };
                    // }

                    // Pay period when contribution will begin.
                    var payrollDeductionComment = "Pay period to start deductions: " + $("#startMonth").val() + "\n";
                    var amountPerPayPeriodComment = "Amount per pay period: " + $("#installmentAmount").val() + " " + document.querySelector('input[name="pay_period"]:checked').value.toLowerCase() + "\n";
                    var numberPayPeriodsComment = "Number of pay periods: " + document.getElementById("numberOfInstallments").value + "\n";

                    // var payrollDeductionStartDate = {
                    //     AttributeId: BBI.Defaults.payrollDeductionStartDate,
                    //     Value: dateNow("/")
                    // };
                    // result.Gift.Attributes.push(payrollDeductionStartDate);

                    // var payrollDeductionFrequency = {
                    //     AttributeId: BBI.Defaults.payrollDeductionFrequency,
                    //     Value: $("input[name='pay_period']:checked").val()
                    // };
                    // result.Gift.Attributes.push(payrollDeductionFrequency);

                    // Payroll Deduction starts after current pledge
                    // if ($('input#startWhenCompleted').prop('checked')) {
                    //     var pdStartAfterCurrentPledge = {
                    //         AttributeId: BBI.Defaults.pdStartAfterCurrentPledge,
                    //         Value: "Y"
                    //     };
                    //     result.Gift.Attributes.push(pdStartAfterCurrentPledge);
                    // }

                    var commentsValue = "";
                    
                    var jointGiftName = "";
                    if ($("#isJointGift").prop("checked") == true) {                        
                        jointGiftName = "Joint gift" + "\n" + $("#spouse").val() + "\n" + "\n";
                        var spouseName = {
                            "AttributeId": BBI.Defaults.customADFAttributes['Joint Spouse Name'],
                            "Value": $("#spouse").val()
                        };
                        // Need Shawn to add this custom attribute for it to work
                        // result.Gift.Attributes.push(spouseName);

                        commentsValue = jointGiftName;
                    }

                    // M#/UCID
                    var employeeID = $("#employeeID").val();
                    var MUCIDcomment = "M#/Employee ID: " + employeeID + "\n" + "\n";

                    // var payrollDeductionMNumber = {
                    //     AttributeId: BBI.Defaults.payrollDeductionMNumber,
                    //     Value: $("#employeeID").val()
                    // };
                    // result.Gift.Attributes.push(payrollDeductionMNumber);

                    // const employerValue = {
                    //     AttributeId: BBI.Defaults.employer,
                    //     Value: $('#employerName option:selected').text()
                    // };
                    // result.Gift.Attributes.push(employerValue);

                    if ($("#comments").val().length !== 0) {
                        commentsValue = commentsValue + $("#comments").val();
                    }

                    result.Gift.Comments = payrollDeductionComment + amountPerPayPeriodComment + numberPayPeriodsComment + MUCIDcomment + commentsValue;

                    result.Gift.Designations = lineItemsData;

                    // result.Gift.PledgeInstallment = pledgeInstallmentData;

                    result.Origin = {
                        PageId: BBI.Defaults.pageId,
                        PageName: 'Faculty & Staff Payroll Deduction Pledges',
                        AppealId: $("#employerName").val(),
                        // PartId: $(".BBDonationApiContainer").attr("data-partid"),
                        // ClientSitesID: $(".BBDonationApiContainer").attr("ClientSitesID")
                    };
                    
                    result.MerchantAccountId = CheckoutModel.MerchantAccountId;
                    result.PartId = $(".BBDonationApiContainer").attr("data-partid");
                    console.log("result");
                    console.log(result);

                    return result;
                }

                // this function submit Donation using CreateDonation() of donationService
                function submitDonationToServer(data) {
                    var donationService = new BLACKBAUD.api.DonationService( $('.BBDonationApiContainer').data('partid') );

                    onSuccess = function (d) {
                        
                        // For Pledge, go ahead and show the confirmation.  For credit card, you will be redirected to BBSP already.
                        if (d.Donation.TransactionStatus === 1) {
                            // $(".form-container").hide();
                            // $(".form").hide();
                            // console.log("here B!");

                            async function openPopupOverlay() {
                                // console.log("calling");
                                const parent = document.getElementById('overlayFlexParent');
                                
                                if (parent) {
                                    // 1. Show the overlay smoothly
                                    parent.classList.add('is-visible');

                                    // 2. Wait 2 seconds (duration of visibility)
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                    
                                    // 3. Start the smooth fade-out
                                    parent.classList.remove('is-visible');
                                }
                                const result = await resolveAfter2Seconds();
                                console.log(result);
                                // Expected output: "resolved"
                            }

                            function resolveAfter2Seconds() {
                                return new Promise((resolve) => {
                                    setTimeout(() => {
                                        // resolve("resolved");
                                        $(".form").hide();
                                        $(".confirmation").show();
                                        // getConfirmationHtml(d.Donation.Id);
                                    }, 500);
                                });
                            }

                            openPopupOverlay();                            
                            // $(".confirmation").show();
                            getConfirmationHtml(d.Donation.Id);
                            $(".page-title h1").text("Thank you!");  
                        }
                        // if (d.Donation.Gift.PaymentMethod === 2) {
                        //     window.location.href = window.location.href + "?t=" + d.Donation.Id;
                        // }
                    };
                    onFail = function (d) {
                        setValidationMessage(convertErrorsToHtml(d));
                    };
                    if (data && data.Donor && data.Donor.Address) {
                        data.Donor.Address.State = $("#state").val();
                    }
                    
                    // sending the response token to validate on server side
                    // data.ResponseToken = responseCaptcha;
                    donationService.createDonation(data, onSuccess, onFail);

                }

                // Display the Final Confirmation screen after Successful Doantion
                function getConfirmationHtml(id) {
                    var donationService = new BLACKBAUD.api.DonationService( $('.BBDonationApiContainer').data('partid') );
                    // console.log("here A!");
                    onSuccess = function (d) {
                        $(".confirmation").html(d);
                        $(".bc-payment").removeClass("active").addClass("complete");
                    };
                    onFail = function (d) {
                        setValidationMessage(convertErrorsToHtml(d));
                    };
                    donationService.getDonationConfirmationHtml(id, onSuccess, onFail);
                }

                function sendData() {
                    console.log(bbcheckout.Configuration); // uncommented
                    if (CheckoutModel && CheckoutModel.MACheckoutSupported && GetPaymentType() == 0) {
                        ProcessCCPayment();
                    } else if (GetPaymentType() == 1)  {
                        var data;
                        setValidationMessage("");
                        setConsentValidationMessage("");
                        data = extractDataFromForm();
                        submitDonationToServer(data);
                    } else {
                        console.log("send data failed...");
                    }
                }

                //use this method for credit card payment through popup
                function ProcessCCPayment() {
                    // console.log("donation object");

                    // console.log(myGift.donation);
                    myGift.donation.MerchantAccountId =
                        bbcheckout.Configuration.Data.MerchantAccountId;
                    myGift.donation.CMSID = bbcheckout.Configuration.Data.CMSID;
                    myGift.donation.TokenId = bbcheckout.Configuration.APITokenID;

                    data = myGift.donation;

                    // submit "tribute" as placeholder for tribute description, so that the donor can leave it blank
                    // if (
                    //     myGift.donation.Gift.Tribute &&
                    //     !myGift.donation.Gift.Tribute.TributeDefinition.Description
                    // ) {
                    //     console.log(myGift.donation.Gift.Tribute); // uncommented
                    //     myGift.donation.Gift.Tribute.TributeDefinition.Description = "tribute";
                    // }

                    // console.log(data);

                    onValidationSuccess = function(result) {
                        makePayment();
                        return false;
                    };
                    onValidationFailed = function(error) {
                        console.log("onValidationFailed");
                        console.log(error); // uncommented
                        //$(".validation").text(error);
                        setValidationMessage(convertErrorsToHtml(error));
                    };
                    ds.validateDonationRequest(data, onValidationSuccess, onValidationFailed);
                }

                /* End Checkout Functions */

                // currency format function
                Number.prototype.formatMoney = function(c, d, t) {
                    var n = this,
                        c = isNaN((c = Math.abs(c))) ? 2 : c,
                        d = d == undefined ? "." : d,
                        t = t == undefined ? "," : t,
                        s = n < 0 ? "-" : "",
                        i = parseInt((n = Math.abs(+n || 0).toFixed(c))) + "",
                        j = (j = i.length) > 3 ? j % 3 : 0;
                    return (
                        s +
                        (j ? i.substr(0, j) + t : "") +
                        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
                        (c ?
                            d +
                            Math.abs(n - i)
                            .toFixed(c)
                            .slice(2) :
                            "")
                    );
                };

                /* GiftSession moved */

                function setCategories(e, subcat) {
                    // SCHOOL OR COLLEGE selected
                    // Arrays of tags to use for filtering designations.  FIRST VALUE IS FOR FILTERING - SECOND VALUE IS DISPLAYED TEXT.
                    // Third value is for default designation.  If included, use this fund as the default choice.
                    var schoolList = [
                        ["The UC Fund", "UC Funds", "The UC Fund"],
                        ["Colleges/Units", "Colleges/units", "Colleges/Units"],
                        ["UC Health", "UC Health", "UC Health"],
                        ["Scholarships", "Scholarships", "Scholarships"],
                        ["29 - Athletics and UCATS", "Athletics and UCATS", "Athletics and UCATS"],
                        ["Search fund by name", "🔍︎ Search fund by name", "Search fund by name"]
                    ];
                    
                    var campusList = [
                        // OTHER AREA selected
                        ["99 - Others", "University-wide", "bec20fdc-0e79-42ae-b353-b5b46c02f73e"],
                        ["The UC Fund", "The UC Fund", ""],
                        ["Scholarships", "Scholarships", ""],
                        ["UC Health", "UC Health", ""],
                        ["29 - Athletics and UCATS", "Athletics and UCATS"],
                        ["25 - College of Allied Health Sciences", "College of Allied Health Sciences"],
                        ["01 - College of Arts & Sciences", "College of Arts &amp; Sciences"],
                        ["04 - College of Design, Architecture, Art & Planning", "College of Design, Architecture, Art &amp; Planning"],
                        ["09 - College of Education, Criminal Justice, and Human Services", "College of Education, Criminal Justice, and Human Services"],
                        ["05 - College of Engineering & Applied Science", "College of Engineering &amp; Applied Science"],
                        ["06 - College of Law", "College of Law"],
                        ["16 - College of Medicine", "College of Medicine"],
                        ["17 - College of Nursing", "College of Nursing"],
                        ["03 - College-Conservatory of Music", "College-Conservatory of Music"],
                        ["43 - Heart, Lung and Vascular Institute", "Heart, Lung and Vascular Institute"],
                        ["23 - Hoxworth", "Hoxworth"],
                        ["33 - Institute for Policy Research", "Institute for Policy Research"],
                        ["02 - Lindner College of Business", "Lindner College of Business"],
                        ["14 - Student Affairs/Provost", "Student Affairs/Provost"],
                        ["28 - UC Alumni Association", "UC Alumni Association"],
                        ["12 - UC Blue Ash College", "UC Blue Ash College"],
                        ["42 - UC Cancer Center", "UC Cancer Center"],
                        ["07 - UC Clermont College", "UC Clermont College"],
                        ["30 - UC Foundation", "UC Foundation"],
                        ["41 - UC Gardner Neuroscience Institute", "UC Gardner Neuroscience Institute"],
                        ["20 - UC Health", "UC Health"],
                        ["26 - UC Libraries", "UC Libraries"],
                        ["18 - Winkle College of Pharmacy", "Winkle College of Pharmacy"],
                    ];
                    var causeList = [
                        ["The UC Fund", "The UC Fund", ""],
                        ["Scholarships", "Scholarships", ""],
                        ["UC Health", "UC Health", ""]
                    ];

                    if (e == "default") {
                        var category = "school";
                    } else {
                        if (typeof e == "object") {
                            // event object passed from selector click
                            var category = e.target.id;
                        } else {
                            // category string passed, taken from URL parameter
                            var category = e;
                        }
                    }
                    if (category.toLowerCase() == "otherarea") category = "campus";
                    switch (category) {
                        case "school":
                            selectList = schoolList;
                            break;
                        // case "campus":
                        //     selectList = campusList;
                        //     break;
                        // case "cause":
                        //     selectList = causeList;
                        //     break;
                        default:
                            selectList = schoolList;
                            break;
                    }
                    var categorySelector = document.getElementById("categoryList");
                    // categorySelector.innerHTML = "";
                    // if (category == "cause")
                    //     $("#categoryList").append(
                    //         '<option value selected="selected">Make a selection</option>'
                    //     );
                    for (var i = 0; i < selectList.length; i++) {
                        var opt = document.createElement("option");
                        opt.value = selectList[i][0].toLowerCase().replace(/[\'\"]/g, "");
                        opt.innerHTML = selectList[i][1];
                        opt.setAttribute("data-default", selectList[i][2]);
                        categorySelector.appendChild(opt);
                    }

                    // If 'subcat' is passed, mark that category as selected
                    if (subcat) {
                        $(
                            "#categoryList option[value='" +
                            subcat.toLowerCase().replace(/[\'\"]/g, "") +
                            "']"
                        ).attr("selected", "selected");
                    }
                }

                function filterCollegesUnits(txt, type, def) {
                    console.log("filterCollegesUnits");
                    // load designations based on category chosen
                    var colUnitArray = [];
                    colUnitArray = designationArray;
                    // console.log(colUnitArray);
                    var colUnitId = document.getElementById("collegeunitList");
                    colUnitId.innerHTML = "<option disabled selected>Select a college/unit to support</option>";

                    // FILTER COLLEGE/UNIT OPTIONS                    
                    const collegeUnitArrayResults = colUnitArray
                        .filter(colUnit => colUnit[8] === "Colleges/Units") // Filter for only College/Units rows
                        .map(colUnit => colUnit[9]);         // Map to get only the name of college/units (index 0)

                    const uniqueNames = [...new Set(collegeUnitArrayResults)];
                    // console.log(uniqueNames); 

                    $.each(uniqueNames, function(key, value) {
                        var trimmedCollege = $.trim(
                            value.substring(value.indexOf("-") + 1)
                        );
                        if (trimmedCollege != "Athletics and UCATS") {
                            $("#collegeunitList").append(
                                $("<option></option>")
                                .val(value)
                                .text(trimmedCollege)
                            );
                        }           
                    });

                    function Ascending_sort(a, b) {
                        return $(b)
                            .text()
                            .toUpperCase() <
                            $(a)
                            .text()
                            .toUpperCase() ?
                            1 :
                            -1;
                    }
                    $("select#collegeunitList option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo("select#collegeunitList");

                    var searchFundOpt = document.createElement("option");
                    searchFundOpt.value = "search fund by name";
                    searchFundOpt.innerHTML = "🔍︎ Search fund by name";

                    var collegeunitSelectVar = document.getElementById("collegeunitList");
                    
                    collegeunitSelectVar.appendChild(searchFundOpt);

                    // END: FILTER COLLEGE/UNIT OPTIONS
                }

                function filterDesignations(txt, type, def) {
                    // console.log("filterDesignations2");
                    // load designations based on category chosen
                    var desArray = [];
                    desArray = designationArray;
                    // console.log(desArray);
                    var desId = document.getElementById("designationId");
                    desId.options.length = 1;
                    // desId.innerHTML = "";                    

                    // Counter for number of designations found
                    var desCount = 0;

                    for (var i = 0; i < desArray.length; i++) {
                        for (var j = 0; j < desArray[i].length; j++) {
                            if (type == "tag") {
                                // Look for exact string match.
                                var compTxt = txt.toLowerCase().replace(/[\'\"]/g, "");
                                comp = compTxt == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");

                                // console.log("desArray[i][j]: " + desArray[i][j]);
                            } else if (txt == "athletics and ucats") {
                                // Look for exact string match.
                                var compTxt = txt.toLowerCase().replace(/[\'\"]/g, "");
                                comp = compTxt == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");
                            } else  {
                                comp = desArray[i][j].toLowerCase().search(txt.toLowerCase()) >= 0;                                
                            }
                            if (comp) {
                                var opt = document.createElement("option");
                                // opt.value = desArray[i][1];
                                opt.value = desArray[i][6]; // GUID of Designation
                                // opt.innerHTML = desArray[i][0] + " - " + desArray[i][2];
                                // opt.innerHTML = desArray[i][1] + " - " + desArray[i][3]; // Fund Name + Lookup ID
                                opt.innerHTML = desArray[i][0]; // Fund Name + Lookup ID
                                opt.setAttribute("data-unitnumber", desArray[i][9].split("-")[0].trim()) // College/Unit (number only)
                                opt.setAttribute("data-description", desArray[i][4]);   // Fund description
                                // opt.setAttribute("data-description", desArray[i][4]); // Designation Description // desArray[i][3]
                                desId.appendChild(opt);
                                desCount++; // add to designation count
                                break;
                            }
                        }
                    }

                    // var causeSelected = $("#cause").hasClass("selected") == true;

                    // append "can't find your fund" option
                    var otherOpt = document.createElement("option");
                    // otherOpt.value = "bec20fdc-0e79-42ae-b353-b5b46c02f73e";
                    otherOpt.value = "default";
                    // otherOpt.innerHTML = "Can't find your fund?";
                    otherOpt.innerHTML = "Select a fund to support";
                    // if (causeSelected) {
                    //     otherOpt.setAttribute(
                    //         "data-description",
                    //         'Please enter a brief description of the area you would like to support below. \nHelp us improve our list by suggesting a "cause" area for your fund selection.'
                    //     );
                    // } else {
                    //     otherOpt.setAttribute(
                    //         "data-description",
                    //         "Please enter a brief description of the area you would like to support below."
                    //     );
                    // }

                    // Default option
                    // otherOpt.setAttribute("data-other", true);
                    // desId.prepend(otherOpt);

                    if (desCount == 1) {
                        $("#designationCount").text(" (" + desCount + " result found)");
                        $("#designationId option").first().attr("selected", "selected");

                        //$("#designationId").val($("#designationId option:first").val());
                        $("#designationId").val($("#designationId option").first().val());
                    } else if(desCount == 0) {
                        $("#designationCount").text("");
                    } else {
                        function checkDesignationIdDefault() {
                            const selectElement = document.getElementById("designationId");
                            const defaultValue = "default"; // The value of your default option

                            if (selectElement.value === defaultValue) {
                                $("#designationCount").text("");
                            } else {
                                $("#designationCount").text(" (" + desCount + " results found)");
                            }
                        }
                        checkDesignationIdDefault();
                    }
                    $("#designationCount").show();

                    if (def && def.length > 10) {
                        // $("#designationId").val(def.toLowerCase());
                    } else {
                        // var desId = $("#designationId option:contains('" + def + "')").val();
                        // if (desId) $("#designationId").val(desId.toLowerCase());
                    }

                    $("div[id*='designationId']").effect("highlight", {}, 700);
                    // setDescription();

                    function Ascending_sort(a, b) {
                        return $(b)
                            .text().toUpperCase() < $(a)
                            .text().toUpperCase() ? 1 : -1;
                    }

                    var searchFundOpt = document.createElement("option");
                    searchFundOpt.value = "search fund by name";
                    searchFundOpt.innerHTML = "🔍︎ Can't find your fund?";

                    var fundSelectVar = document.getElementById("designationId");
                    $("#designationId option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo(fundSelectVar);
                    
                    fundSelectVar.appendChild(searchFundOpt);
                }

                function filterSearchDesignations(txt, type, def) {
                    console.log("filterDesignations3 search");
                    // load designations based on category chosen
                    var desArray = [];
                    desArray = designationSearchArray;
                    console.log(desArray);
                    var desId = document.getElementById("designationId");
                    desId.options.length = 1;
                    // desId.innerHTML = "";

                    // Counter for number of designations found
                    var desCount = 0;

                    for (var i = 0; i < desArray.length; i++) {
                        for (var j = 0; j < desArray[i].length; j++) {
                            if (type == "tag") {
                                // Look for exact string match.
                                var compTxt = txt.toLowerCase().replace(/[\'\"]/g, "");
                                comp = compTxt == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");
                                // console.log("type == tag: " + comp);
                                // console.log("desArray[i][j]: " + desArray[i][j]);
                            } else {
                                comp = desArray[i][j].toLowerCase().search(txt.toLowerCase()) >= 0;
                                // console.log("type != tag: " + comp);                             
                            }
                            if (comp) {
                                var firstParenIndex = desArray[i][0].indexOf('(');
                                var secondParenIndex = desArray[i][0].indexOf('(', firstParenIndex + 1);

                                let result;
                                if (secondParenIndex !== -1) {
                                    // If a second parenthesis is found, split the string into two parts:
                                    // 1. From the start to the second parenthesis
                                    // 2. From the second parenthesis to the end
                                    const part1 = desArray[i][0].slice(0, secondParenIndex);
                                    const part2 = desArray[i][0].slice(secondParenIndex);
                                    result = [part1];
                                } else {
                                    // If no second parenthesis is found, return the original string as the only element
                                    var index = desArray[i][0].indexOf('(');
                                    let firstPart;
                                    firstPart = desArray[i][0].slice(0, index);
                                    result = [firstPart];
                                    // result = [desArray[i][0]];
                                }

                                var opt = document.createElement("option");
                                // opt.value = desArray[i][1];
                                opt.value = desArray[i][2]; // GUID of Designation
                                // opt.innerHTML = desArray[i][0] + " - " + desArray[i][2];
                                // opt.innerHTML = desArray[i][1] + " - " + desArray[i][3]; // Fund Name + Lookup ID
                                // opt.innerHTML = result; // Fund Name + Lookup ID 
                                opt.innerHTML = desArray[i][0];
                                opt.setAttribute("data-description", desArray[i][0]); // Fund description
                                // opt.setAttribute("data-description", desArray[i][4]); // Designation Description // desArray[i][3]
                                desId.appendChild(opt);
                                desCount++; // add to designation count
                                break;
                            }
                        }
                    }

                    // var causeSelected = $("#cause").hasClass("selected") == true;

                    // append "can't find your fund" option
                    var otherOpt = document.createElement("option");
                    // otherOpt.value = "bec20fdc-0e79-42ae-b353-b5b46c02f73e";
                    otherOpt.value = "default";
                    // otherOpt.innerHTML = "Can't find your fund?";
                    otherOpt.innerHTML = "Select a fund to support";
                    // if (causeSelected) {
                    //     otherOpt.setAttribute(
                    //         "data-description",
                    //         'Please enter a brief description of the area you would like to support below. \nHelp us improve our list by suggesting a "cause" area for your fund selection.'
                    //     );
                    // } else {
                    //     otherOpt.setAttribute(
                    //         "data-description",
                    //         "Please enter a brief description of the area you would like to support below."
                    //     );
                    // }

                    // Default option
                    // otherOpt.setAttribute("data-other", true);
                    // desId.prepend(otherOpt);

                    if (desCount == 1) {
                        $("#designationCount").text(" (" + desCount + " result found)");
                        $("#designationId option").last().attr("selected", "selected");

                        //$("#designationId").val($("#designationId option:first").val());
                        $("#designationId").val($("#designationId option").last().val());
                    } else if(desCount == 0) {
                        $("#designationCount").text(" (0 result found)");
                    } else {
                        function checkDesignationIdDefault() {
                            const selectElement = document.getElementById("designationId");
                            const defaultValue = "default"; // The value of your default option

                            if (selectElement.value === defaultValue) {
                                $("#designationCount").text("");
                            } else {
                                $("#designationCount").text(" (" + desCount + " results found)");
                            }
                        }
                        checkDesignationIdDefault();
                    }
                    $("#designationCount").show();

                    if (def && def.length > 10) {
                        // $("#designationId").val(def.toLowerCase());
                    } else {
                        // var desId = $("#designationId option:contains('" + def + "')").val();
                        // if (desId) $("#designationId").val(desId.toLowerCase());
                    }

                    $("div[id*='designationId']").effect("highlight", {}, 700);
                    // setDescription(); removing descriptions 12/15/25

                    function Ascending_sort(a, b) {
                        return $(b)
                            .text().toUpperCase() < $(a)
                            .text().toUpperCase() ? 1 : -1;
                    }

                    var fundSelectVar = document.getElementById("designationId");
                    $("#designationId option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo(fundSelectVar);

                    // var searchFundOpt = document.createElement("option");
                    // searchFundOpt.value = "search fund by name";
                    // searchFundOpt.innerHTML = "Can't find your fund? Try searching another way.";
                    
                    // fundSelectVar.appendChild(searchFundOpt);
                }

                function filterCollegeUnitDesignations(txt, type, def) {
                    console.log("filterDesignations3");
                    // load designations based on category chosen
                    var colUnitDesignationArray = [];
                    colUnitDesignationArray = designationArray;
                    // console.log(colUnitDesignationArray);
                    var desId = document.getElementById("designationId");
                    desId.options.length = 1;
                    // desId.innerHTML = "";

                    const collegeUnitArrayDesignations = colUnitDesignationArray
                        .filter(colUnit => colUnit[8] === "Colleges/Units");

                    // console.log(colUnitDesignationArray);

                    // Counter for number of designations found
                    var desCount = 0;

                    for (var i = 0; i < collegeUnitArrayDesignations.length; i++) {
                        for (var j = 0; j < collegeUnitArrayDesignations[i].length; j++) {
                            if (type == "tag") {
                                // Look for exact string match.
                                var compTxt = txt.toLowerCase().replace(/[\'\"]/g, "");
                                comp = compTxt == collegeUnitArrayDesignations[i][j].toLowerCase().replace(/[\'\"]/g, "");

                                // console.log("desArray[i][j]: " + desArray[i][j]);
                            } else {
                                comp = collegeUnitArrayDesignations[i][j].toLowerCase().search(txt.toLowerCase()) >= 0;
                            }
                            
                            if (comp && collegeUnitArrayDesignations[i][8] == "Colleges/Units") {
                                var opt = document.createElement("option");
                                // opt.value = desArray[i][1];
                                opt.value = collegeUnitArrayDesignations[i][6]; // GUID of Designation
                                opt.setAttribute("data-unitnumber", collegeUnitArrayDesignations[i][9].split("-")[0].trim()) // College/Unit (number only)
                                opt.setAttribute("data-description", collegeUnitArrayDesignations[i][4]); // Fund description
                                // opt.innerHTML = desArray[i][0] + " - " + desArray[i][2];
                                // opt.innerHTML = desArray[i][1] + " - " + desArray[i][3]; // Fund Name + Lookup ID
                                opt.innerHTML = collegeUnitArrayDesignations[i][0]; // Fund Name + Lookup ID
                                // opt.setAttribute("data-description", colUnitDesignationArray[i][4]); // Designation Description // desArray[i][3]
                                desId.appendChild(opt);
                                desCount++; // add to designation count
                                break;
                            }
                        }
                    }

                    // var causeSelected = $("#cause").hasClass("selected") == true;

                    // append "can't find your fund" option
                    var otherOpt = document.createElement("option");
                    // otherOpt.value = "bec20fdc-0e79-42ae-b353-b5b46c02f73e";
                    otherOpt.value = "default";
                    // otherOpt.innerHTML = "Can't find your fund?";
                    otherOpt.innerHTML = "Select a fund to support";
                    // if (causeSelected) {
                    //     otherOpt.setAttribute(
                    //         "data-description",
                    //         'Please enter a brief description of the area you would like to support below. \nHelp us improve our list by suggesting a "cause" area for your fund selection.'
                    //     );
                    // } else {
                    //     otherOpt.setAttribute(
                    //         "data-description",
                    //         "Please enter a brief description of the area you would like to support below."
                    //     );
                    // }
                    
                    // otherOpt.setAttribute("data-other", true);
                    // desId.prepend(otherOpt);

                    if (desCount == 1) {
                        $("#designationCount").text(" (" + desCount + " result found)");
                        // $("#designationId option").first().attr("selected", "selected");

                        //$("#designationId").val($("#designationId option:first").val());
                        // $("#designationId").val($("#designationId option").first().val());
                    } else {
                        $("#designationCount").text(" (" + desCount + " results found)");

                        function Ascending_sort(a, b) {
                            return $(b)
                                .text().toUpperCase() < $(a)
                                .text().toUpperCase() ? 1 : -1;
                        }

                        $("#designationId option:not(:first)").sort(Ascending_sort);
                    }
                    $("#designationCount").show();

                    if (def && def.length > 10) {
                        // $("#designationId").val(def.toLowerCase());
                    } else {
                        // var desId = $("#designationId option:contains('" + def + "')").val();
                        // if (desId) $("#designationId").val(desId.toLowerCase());
                    }

                    $("div[id*='designationId']").effect("highlight", {}, 700);
                    // setDescription();

                    var searchFundOpt = document.createElement("option");
                    searchFundOpt.value = "search fund by name";
                    searchFundOpt.innerHTML = "🔍︎ Can't find your fund?";

                    var fundSelectVar = document.getElementById("designationId");
                    $("#designationId option:not(:first)")
                        .sort(Ascending_sort)
                        .appendTo(fundSelectVar);

                    fundSelectVar.appendChild(searchFundOpt);                    
                }

                function stepUpdate(gift, step) {
                    // remove 'active' class from all except the one passed in 'step' argument
                    $(".validation").html("");
                    $(".designations .amount, #otherAmtInput").removeClass("selected");
                    // $("#otherAmtInstr").hide();
                    $(".designations #otherAmtInput").val("");
                    step = Number(step);

                    if ($('#donation-form.payroll').length !== 0) {
                        switch (
                            step // conditional handling for different steps
                        ) {
                            case 1:
                                // Gift step
                                // progress-1 class
                                $(".steps").removeClass("active");
                                $(".step" + step).addClass("active");
                                $(".breadcrumb").removeClass("active");
                                $(".bc-designation").addClass("active");
                                $(".breadcrumbs .form-step").parent().removeClass("complete");
                                if (gift.donation.Gift.Designations.length > 0) {
                                    $("#cancelAddLineItem").show();
                                } else {
                                    $("#cancelAddLineItem").hide();
                                }
                                $(".breadcrumbs")
                                    .removeClass("progress-2")
                                    .addClass("progress-1");
                                break;
                            case 2:
                                // Payroll step
                                // Gift step --> Complete
                                // progress-2 class
                                $(".steps").removeClass("active");
                                $(".step" + step).addClass("active");
                                $(".breadcrumb").removeClass("active");
                                $(".bc-payroll").addClass("active");
                                $(".breadcrumbs .breadcrumb:nth-child(n+1) .form-step")
                                    .parent().removeClass("complete");
                                $(".bc-designation .form-step")
                                    .parent().addClass("complete");
                                $(".breadcrumbs")
                                    .removeClass("progress-1")
                                    .removeClass("progress-3")
                                    .addClass("progress-2");
                                break;
                            case 3:
                                if (gift.validate(2)) {
                                    // Information step
                                    // Payroll step --> Complete
                                    // progress-3 class
                                    $(".steps").removeClass("active");
                                    $(".step" + step).addClass("active");
                                    $(".breadcrumb").removeClass("active");
                                    $(".bc-billing").addClass("active");
                                    $(".bc-payroll .form-step")
                                        .parent().addClass("complete");
                                    $(".bc-billing.active").removeClass("complete");
                                    $(".breadcrumbs")
                                        .removeClass("progress-2")
                                        .removeClass("progress-4")
                                        .addClass("progress-3");
                                } else {}
                                break;
                            // case 4:
                            //     if (gift.validate(3)) {
                            //         // Tribute step
                            //         // Information step --> Complete
                            //         // progress-4 class
                            //         $(".steps").removeClass("active");
                            //         $(".step" + step).addClass("active");
                            //         $(".breadcrumb").removeClass("active");
                            //         $(".bc-review").addClass("active");
                            //         $(".bc-billing .form-step")
                            //             .parent().addClass("complete");
                            //         $(".breadcrumbs")
                            //             .removeClass("progress-3")
                            //             .removeClass("progress-5")
                            //             .addClass("progress-4");
                            //     } else {}
                            //     break;
                            case 4:
                                if (gift.validate(4)) {
                                    // Payment step
                                    // Payment modal appears
                                    // progress-5 class
                                    // $(".steps").removeClass("active");
                                    // $(".step" + step).addClass("active");
                                    $(".breadcrumb").removeClass("active");
                                    // $(".bc-billing").addClass("active");
                                    $(".bc-payment").addClass("active");
                                    $(".bc-billing .form-step")
                                        .parent().addClass("complete");
                                    $(".breadcrumbs")
                                        .removeClass("progress-3")
                                        .addClass("progress-4");
                                } else {}
                                break;
                            default:
                                break;
                        }
                    } else {
                        switch (
                            step // conditional handling for different steps
                        ) {
                            case 1:
                                // Gift step
                                // progress-1 class
                                $(".steps").removeClass("active");
                                $(".step" + step).addClass("active");
                                $(".breadcrumb").removeClass("active");
                                $(".bc-designation").addClass("active");
                                $(".breadcrumbs .form-step").parent().removeClass("complete");
                                if (gift.donation.Gift.Designations.length > 0) {
                                    $("#cancelAddLineItem").show();
                                } else {
                                    $("#cancelAddLineItem").hide();
                                }
                                $(".breadcrumbs")
                                    .removeClass("progress-2")
                                    .removeClass("progress-3")
                                    .removeClass("progress-4")
                                    .addClass("progress-1");

                                $("#designationSearch").typeahead("val", "");
                                break;
                            case 2:
                                // Information step
                                // Gift step --> Complete
                                // progress-2 class
                                $(".steps").removeClass("active");
                                $(".step" + step).addClass("active");
                                $(".breadcrumb").removeClass("active");
                                // $(".bc-review").addClass("active");
                                $(".bc-billing").addClass("active");
                                $(".breadcrumbs .breadcrumb:nth-child(n+1) .form-step")
                                    .parent().removeClass("complete");
                                $(".bc-designation .form-step")
                                    .parent().addClass("complete");
                                $(".breadcrumbs")
                                    .removeClass("progress-1")
                                    .removeClass("progress-3")
                                    .removeClass("progress-4")
                                    .addClass("progress-2");
                                break;
                            case 3:
                                if (gift.validate(2)) {
                                    // Tribute step
                                    // Ifnromation step --> Complete
                                    // progress-3 class
                                    $(".steps").removeClass("active");
                                    $(".step" + step).addClass("active");
                                    $(".breadcrumb").removeClass("active");
                                    // $(".bc-billing").addClass("active");
                                    $(".bc-review").addClass("active");
                                    $(".bc-billing .form-step")
                                        .parent().addClass("complete");
                                    $(".breadcrumbs")
                                        .removeClass("progress-1")
                                        .removeClass("progress-2")
                                        .removeClass("progress-4")
                                        .addClass("progress-3");
                                } else {}
                                break;
                            case 4:
                                if (gift.validate(3)) {
                                    // Payment step
                                    // Payment modal appears
                                    // progress-4 class
                                    // $(".steps").removeClass("active");
                                    // $(".step" + step).addClass("active");
                                    $(".breadcrumb").removeClass("active");
                                    // $(".bc-billing").addClass("active");
                                    $(".bc-payment").addClass("active");
                                    $(".bc-review .form-step")
                                        .parent().addClass("complete");
                                    $(".breadcrumbs")
                                        .removeClass("progress-1")
                                        .removeClass("progress-2")
                                        .removeClass("progress-3")
                                        .addClass("progress-4");
                                } else {}
                                break;
                            default:
                                break;
                        }
                    }
                    if (!$(".validation-message").length) {
                        //console.log("no validation message");
                        $("html, body").animate({
                            scrollTop: 0
                        }, 10);
                    }
                }

                /* Helper functions */
                function scrollToFieldset(fieldsetId, offset) {
                    const element = document.getElementById(fieldsetId);
                    if (element) {
                        // Get current position relative to viewport
                        const elementPosition = element.getBoundingClientRect().top;
                        // Calculate final position, accounting for fixed header/offset
                        const offsetPosition = elementPosition + window.pageYOffset - offset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }

                function resetFields() {
                    // Reset the following fields
                    // 1. Area to Support dropdown reset to default option
                        document.getElementById("categoryList").selectedIndex = 0;
                    // 2. College/unit to support dropdown reset to default option
                        document.getElementById("collegeunitList").selectedIndex = 0; 
                    // 3. Find a fund by searching text field
                        $("#designationSearch").typeahead("val", "");
                    // 4. Select a fund dropdown reset to default option
                        var fundSelector = document.getElementById("designationId");
                            fundSelector.innerHTML = "";

                        var opt = document.createElement("option");
                        opt.value = "";
                        opt.innerHTML = "Choose a fund";
                        opt.setAttribute("selected", "selected");
                        fundSelector.appendChild(opt);
                    // 5. Amount selection and other amount field
                        $(".amounts .amount").removeClass("selected");
                        $("#otherAmtInput").val("");   
                    // 6. Hide fields: College/unit dropdown, Find a fund text box, Select a fund dropdown
                        $(".collegeunit-select, .designation-select, .designationSearch-select").hide();
                }

                function formatIntlPhone(countrycode) {
                    console.log("formatIntlPhone: " + countrycode);
                    var phoneInput = document.getElementById("phone"),
                        acknPhoneInput = document.getElementById("acknowledgeePhone");

                    phoneInput.addEventListener("input", function (e) {
                        if (countrycode == "US" || countrycode == "CA" || countrycode == "DO") {
                            var x = e.target.value.replace(/\D/g, "").match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                            e.target.value = !x[2] ? x[1] : x[1] + "-" + x[2] + (x[3] ? '-' + x[3] : "");
                        } else if (countrycode == "UK") {
                            var x = e.target.value.replace(/\D/g, "").match(/(\d{0,2})(\d{0,4})(\d{0,4})/);
                            e.target.value = !x[2] ? x[1] : x[1] + "-" + x[2] + (x[3] ? '-' + x[3] : "");
                        } else if (countrycode == "TW") {
                            var x = e.target.value.replace(/\D/g, "").match(/(\d{0,2})(\d{0,4})(\d{0,4})/);
                            e.target.value = !x[2] ? x[1] : x[1] + "-" + x[2] + (x[3] ? '-' + x[3] : "");
                        } else {
                            // do nothing
                        }
                        
                    });

                    acknPhoneInput.addEventListener("input", function (e) {
                        if (countrycode == "US" || countrycode == "CA") {
                            var x = e.target.value.replace(/\D/g, "").match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                            e.target.value = !x[2] ? x[1] : x[1] + "-" + x[2] + (x[3] ? '-' + x[3] : "");
                        } else if (countrycode == "UK") {
                            var x = e.target.value.replace(/\D/g, "").match(/(\d{0,2})(\d{0,4})(\d{0,4})/);
                            e.target.value = !x[2] ? x[1] : x[1] + "-" + x[2] + (x[3] ? '-' + x[3] : "");
                        } else {
                            // do nothing
                        }
                    });
                }
                

                // update other amount value and disable if 'other' radio button is not checked
                /* function updateAmountInputs() {
                    $("#otherAmount").val($("#otherAmountInput").val());
                    if ($("#otherAmount").prop("checked") == true) {
                        $("#otherAmountInput").prop("disabled", false);
                    } else {
                        $("#otherAmountInput").val("");
                        $("#otherAmountInput").prop("disabled", true);
                    }
                } */

                /* function setDescription() {
                    var descr = $("#designationId option:selected").attr("data-description");
                    if (descr && descr.replace(" ", "").length > 0) {
                        $(".designation-description").show();
                        $("#desDescrText").text(descr);
                        $("#designationDescription").show().effect("highlight", {}, 700);
                    } else {
                        $(".designation-description").hide();
                        $("#desDescrText").text("");
                        $("#designationDescription").hide();
                    }
                    // if ($("#designationId option:selected").attr("data-other") == "true") {
                    //     $("#otherDesignation").show();
                    // } else {
                    //     $("#otherDesignation").hide();
                    //     $("#otherDesignationInput").val("");
                    // }
                } */

                // Set the category button styles and run function(s) to load category tags, etc.
                // (moved from .designation-categories click function)
                function updateCategories(e, subcat) {
                    $(".designation-categories a").removeClass("selected");

                    if (typeof e == "object") {
                        var groupId = e.target.id;
                    } else {
                        var groupId = e;
                    }
                    if (groupId.toLowerCase() == "otherarea") groupId = "campus";
                    if (groupId == "") groupId = "search";
                    $(".designation-categories a[id='" + groupId + "']").addClass("selected");
                    if (groupId != "search") setCategories(groupId, subcat);

                    switch (groupId) {
                        case "school":
                            $(".designation-search").hide();
                            $(".category-select").show();
                            $("#categoryLabel").html("Which school or college?");
                            break;
                        case "campus":
                            $(".designation-search").hide();
                            $(".category-select").show();
                            $("#categoryLabel").html("Which area?");
                            break;
                        case "cause":
                            $("#categoryLabel").html("Which cause?");
                            $(".category-select").show();
                            $(".designation-search").hide();
                            break;
                        case "search":
                            $(".category-select").hide();
                            $(".designation-search").show();
                            break;
                        default:
                            break;
                    }
                }

                function giftTypeUpdate(e) {
                    $(".gift-type a").removeClass("selected");

                    if (typeof e == "object") {
                        var groupId = e.target.id;
                    } else {
                        var groupId = e;
                    }

                    $(".gift-type a[id='" + groupId + "']").addClass("selected");
                    recurringHandler();
                }

                // check recurring box when page loads, run recurring handler
                function recurringHandler() {
                    // $(".gift-frequency").removeClass("selected");
                    // $("#recurringGift").addClass("selected");

                    // if ($("#recurringGift").prop("checked") == true) {
                    // if ($("#giftType").val() == "Monthly") {

                    if ($(".gift-type a#Monthly").hasClass("selected")) {
                        $("#pledgeSection").hide();       // Pledge Payment section section  
                        $(".donationInformation").show(); // Select Fund section
                        
                        // $("#returnToGiftDetail").hide();

                        if ($("#tributeCheckbox").prop("checked") == true) {
                            $("#tributeInfoSub").show();
                            $(".tribute-type, .tribute-name")
                                .val("")
                                .addClass("hide");

                            $("#chkAcknowledge").prop("checked", false);                            
                            $("#acknowledgeeInfoSub input").val("");
                            $("#acknowledgeeInfoSub").hide();
                            $(".tribute-ack").addClass("hide");
                            console.log("recurring changed");

                            // var conf = confirm(
                            //     "A recurring gift cannot be made with a tribute. Do you want to change your gift to a recurring gift instead of a tribute?"
                            // );

                            // if (conf == true) {
                            //     // uncheck and hide tribute section
                            //     $("#tributeCheckbox").removeAttr("checked");
                            //     $("#tributeCheckbox").prop("checked", false);
                            //     $("#tributeInfoSub").hide();
                            //     // $("#returnToGiftDetail").hide();
                            // } else {
                            //     // check "one time gift" and hide recurrence section
                            //     // $("#recurringGift").prop("checked", false);
                            //     // document.getElementById("giftType").value = "One-Time";
                            //     $(".gift-type a#One-Time").addClass("selected");

                            //     //$("#chkAcknowledge").click();
                            //     $(".gift-frequency").removeClass("selected");
                            //     $("#oneTimeGift").addClass("selected");
                            //     $("#recurrenceSection").hide();
                            //     $("#returnToGiftDetail").show();
                            //     $("#giftType").parent().show();
                            //     return;
                            // }
                        } else {}
                        $("#recurrenceSection").show();     // Recurrence section
                        // $("#giftType").parent().hide();
                        // $("#giftType").val("One-Time"); // "New Gift"

                        // $("#dayOfMonth").parent().hide();
                        // if ($("#frequency").val() == 4) {
                        //     $("#month").parent().show();
                        // } else {
                        //     $("#month").parent().hide();
                        // }
                    } else if ($(".gift-type a#Pledge").hasClass("selected")) {
                        $("#pledgeSection, #cancelAddLineItem").show();
                        $("#recurrenceSection").hide(); // Hide recurrence section
                        $("#giftSummary").hide(); // Hide My gift section
                        $(".tribute-type, .tribute-name, .tribute-ack").removeClass("hide");
                        $(".donationInformation").hide(); // Select Fund section
                    } else {
                        $(".donationInformation").show(); // Select Fund section
                        $("#returnToGiftDetail").show();
                        $("#recurrenceSection, #pledgeSection").hide();
                        $("#giftType").parent().show();
                        $(".tribute-type, .tribute-name, .tribute-ack").removeClass("hide");
                    }

                    myGift.update();
                    if ($(".gift-type a#Pledge").hasClass("selected")) {
                        // do nothing
                    } else {
                        myGift.displayLineItems();
                    }
                }

                function populateStartDate() {
                    var d = new Date(),
                        day = d.getDate();

                    function getMinDate() {
                        var date = new Date();
                        if (day > 15) {
                            date.setMonth(date.getMonth() + 1, 1);
                        } else if (day == 1) {
                            // set to current date
                        } else {
                            date.setDate(15);
                        }
                        return date;
                    }
                    $("#startDate").datepicker({
                        beforeShowDay: function(dt) {
                            return [
                                dt.getDate() == 1 || dt.getDate() == 15 ?
                                true :
                                false,
                            ];
                        },
                        minDate: getMinDate(),
                    });
                    $("#startDate").datepicker("setDate", getMinDate());
                }

                // Compare function to sort designationArray by titles
                function compareDesignationLabels(a, b) {
                    var aLabel = removeArticles(a[0].toLowerCase()),
                        bLabel = removeArticles(b[0].toLowerCase());

                    if (aLabel < bLabel) {
                        return -1;
                    }
                    if (aLabel > bLabel) {
                        return 1;
                    }
                    // a must be equal to b
                    return 0;
                }

                function compare(a, b) {
                    if (a[0].replace('"', "") < b[0].replace('"', "")) return -1;
                    if (a[0].replace('"', "") > b[0].replace('"', "")) return 1;
                    return 0;
                }

                function removeArticles(str) {
                    words = str.split(" ");
                    if (words.length <= 1) return str;
                    if (words[0] == "a" || words[0] == "the" || words[0] == "an")
                        return words.splice(1).join(" ");
                    return str;
                }

                function submitAnalytics() {
                    // Google Analytics
                    // add split amounts
                    var total = 0;
                    var desString = "";
                    for (var i = 0; i < myGift.donation.Gift.Designations.length; i++) {
                        total += Number(myGift.donation.Gift.Designations[i].Amount);

                        // Create the designation string
                        if (i >= 1) {
                            desString +=
                                ", " +
                                myGift.donation.Gift.Designations[i].Name +
                                " ($" +
                                Number(myGift.donation.Gift.Designations[i].Amount).toFixed(2) +
                                ")";
                        } else {
                            desString +=
                                myGift.donation.Gift.Designations[i].Name +
                                " ($" +
                                Number(myGift.donation.Gift.Designations[i].Amount).toFixed(2) +
                                ")";
                        }
                    }

                    // GA4/GTM data layer
                    var gaItems = [];
                    for (var i = 0; i < myGift.donation.Gift.Designations.length; i++) {
                        gaItems.push({
                            item_id: myGift.donation.Gift.Designations[i].DesignationId,
                            item_name: myGift.donation.Gift.Designations[i].Name,
                            item_category: productName,
                            price: myGift.donation.Gift.Designations[i].Amount,
                            quantity: 1
                        });
                    }

                    dataLayer.push({
                        ecommerce: null
                    }); // Clear the previous ecommerce object.

                    dataLayer.push({
                        event: "donation",
                        ecommerce: {
                            transaction_id: myGift.donation.TokenId,
                            value: total,
                            currency: "USD",
                            items: gaItems
                        }
                    });

                    console.log("Submit gaItems!");
                    console.log(gaItems);

                    console.log("Submit dataLayer!");
                    console.log(dataLayer);
                    // End GA4/GTM data layer

                    // Match360 / Double the Donation code              	
                    if (window.doublethedonation) { // Don't break your page if our plugin doesn't load for any reason               		              		
                        var doublethedonation_company_id = $("input[name='doublethedonation_company_id']").val();
                        var doublethedonation_status = $("input[name='doublethedonation_status']").val();
                        var doublethedonation_entered_text = $("input[name='doublethedonation_entered_text']").val();            		
                        var match360Object = {
                            "360matchpro_public_key": "N6tBG3KcsjhTlVVR",   //Replace this key with your 360MatchPro public key
                            "campaign": "Online Donation",
                            "donation_identifier": myGift.donation.TokenId,
                            "donation_amount": total,
                            "donor_first_name": myGift.donation.Donor.FirstName,
                            "donor_last_name": myGift.donation.Donor.LastName,
                            "donor_email": myGift.donation.Donor.EmailAddress,
                            "donor_address": {
                                "zip": myGift.donation.Donor.Address.PostalCode,         //numeric, but string (eg. "30301", "30101-123") will work
                                "city": myGift.donation.Donor.Address.City,
                                "state": myGift.donation.Donor.Address.State,
                                "address1": myGift.donation.Donor.Address.StreetAddress,
                                "country" : myGift.donation.Donor.Address.Country
                            },   //ISO 3166-1 alpha-2 country code (eg. "US", "CA", "GB")
                            "donor_phone": myGift.donation.Donor.Phone,       //This is an example. Your phone number can be formatted differently.
                            "doublethedonation_company_id": doublethedonation_company_id,     // only needed if using streamlined search
                            "doublethedonation_status": doublethedonation_status,    // only needed if using streamlined search
                            "doublethedonation_entered_text": doublethedonation_entered_text // only needed if streamlined search used on donation page 
                            };          			
                            doublethedonation.integrations.core.register_donation(match360Object);
                    };
                }

                function getCountries() {
                    var selectCountry = $("#country");
                    var selectAcknowledgeeCountry = $("#acknowledgeeCountry");
                    var service = new BLACKBAUD.api.CountryService();
                    var usVal = "";

                    // Load Countries
                    service.getCountries(function(countries) {
                        for (var i = 0, j = countries.length; i < j; i++) {
                            if (countries[i].Description == "United States") {
                                selectCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" selected="selected" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                                selectAcknowledgeeCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" selected="selected" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                                usVal = countries[i].Id;
                                // console.log('usVal: ' + usVal);
                            } else {
                                selectCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                                selectAcknowledgeeCountry.append(
                                    '<option value="' +
                                    countries[i].ISO +
                                    '" data-guid="' +
                                    countries[i].Id +
                                    '">' +
                                    countries[i].Description +
                                    "</option>"
                                );
                            }
                        }
                        // getStates(usVal, $("#state"));
                        // getStates(usVal, $("#province"));
                        // getStates(usVal, $("#acknowledgeeState"));
                    });

                    // Watch Countries Change
                    // $("#country").on("change", function() {
                    //     var selectedCountry = $(this).find("option:selected").attr("data-guid");
                    //     // console.log($(this).val());
                    //     if ($(this).val() == "US") {
                    //         // Load States
                    //         $(".state-input").removeClass("hide");
                    //         $(".province-input").addClass("hide");
                    //     } else {
                    //         $(".state-input").addClass("hide");
                    //         $(".province-input").removeClass("hide");
                    //         getStates(selectedCountry, $("#province")); // #state
                    //     }

                    //     //myGift.update();
                    // });

                    $("#acknowledgeeCountry").on("change", function() {
                        var selectedCountry = $(this).find("option:selected").attr("data-guid");

                        // Load States
                        // getStates(selectedCountry, $("#acknowledgeeState"));
                    });
                }

                function getStates(country, selectState) {
                    var service = new BLACKBAUD.api.CountryService();

                    // Load States
                    service.getStates(country, function(states) {
                        selectState.html("");
                        for (var i = 0, j = states.length; i < j; i++) {
                            if (states[i].Description == "Ohio") {
                                selectState.append(
                                    '<option value="' +
                                    states[i].ISO +
                                    '" selected="selected">' +
                                    states[i].Description +
                                    "</option>"
                                );
                            } else if (states[i].Description == "N/A") {
                                selectState.append(
                                    '<option value="' +
                                    states[i].ISO +
                                    '" selected="selected">' +
                                    states[i].Description +
                                    "</option>"
                                );
                            } else {
                                selectState.append(
                                    '<option value="' +
                                    states[i].ISO +
                                    '">' +
                                    states[i].Description +
                                    "</option>"
                                );
                            }
                        }
                        //if (myGift) myGift.update();
                        if (myGift && "update" in myGift) myGift.update();
                    });
                }

                function getDesignations() {
                    // See about putting everything in here instead of initializing the Query API in the form setup.
                    // Maybe pass the Query ID instead of hard-coding it inside the function.
                    blockForm($(".donationForm"));

                    // LOAD FUNDS VIA JSON
                    /*
                    async function getFundData() {
                        const res = await fetch('/file/ucf-ds/funds.json');
                        const data = await res.json();

                        const valuesArray = data.Rows.map(row => row.Values);

                        const seenLabels = new Set();

                        const selectedColumnsArray = data.Rows
                            .map(row => ({
                                value: row.Values[6],
                                label: row.Values[0],
                                cat: row.Values[8],
                                subcat: row.Values[9]
                            }))
                            .filter(item => {
                                if (seenLabels.has(item.label)) {
                                    return false;
                                }
                                seenLabels.add(item.label);
                                return true;
                            });

                        return {
                            valuesArray,
                            selectedColumnsArray
                        };
                    }

                    // Usage
                    getFundData().then(({ valuesArray, selectedColumnsArray }) => {
                        // console.log('All Values:', valuesArray);
                        // console.log('Selected Columns:', selectedColumnsArray);

                        designationArray = valuesArray;
                        fuseSearchArray = selectedColumnsArray;
                        sortArrays();
                    });

                    function sortArrays() {
                        fuseSearch(fuseSearchArray.sort());

                        // sort array results and remove duplicates
                        var sortedArray = designationArray.sort(compare);
                        var tidiedArray = [];
                        // console.log(sortedArray); // ALL FUNDS

                        // alternate designation process:
                        // - create second array (tidiedArray)
                        // - loop through first array and
                        // -- push funds that aren't already in the array
                        // -- if they are already in the array, push the tag
                        for (var i = 0; i < sortedArray.length; i++) {
                            if (tidiedArray.indexOf(sortedArray[i]) < 0) {
                                tidiedArray.push(sortedArray[i]);
                            }
                        }

                        // for (var i = 0; i < sortedArray.length - 1; i++) {
                        //     // need a way to check more than just the next, or previous, fund
                        //     // for each fund, loop through the upcoming funds until the name does 
                        //     // NOT match the current name - grab and push the tags and delete the funds

                        //     if (sortedArray[i][0] == sortedArray[i + 1][0]) {
                        //         sortedArray[i + 1].push(sortedArray[i][3]);
                        //         sortedArray.splice(i, 1);
                        //     }
                        // }
                        // designationArray = sortedArray;
                        // console.log(sortedArray); // FILTERED FUNDS

                        // Generate option elements for designation selectors, based on designationArray
                        for (var i = 0; i < designationArray.length; i++) {
                            var otherDes = document.getElementById("designationId");
                            var otherOpt = document.createElement("option");
                            otherOpt.value = designationArray[i][1];
                            otherOpt.innerHTML =
                                designationArray[i][0] + " - " + designationArray[i][2];
                            otherOpt.setAttribute("data-description", designationArray[i][4]);
                            otherDes.appendChild(otherOpt);
                        }
                        if (subcat) {
                            // *** add des filter.  It should fail gracefully, if fund isn't found...
                            // updateCategories(cat, subcat);
                            setCategories(cat, subcat);
                            console.log("setCategories C location");
                            if (des) {
                                filterDesignations(subcat, "tag", des);
                            } else {
                                var def = $(
                                    "#categoryList option[value='" +
                                    subcat.toLowerCase().replace(/[\'\"]/g, "") +
                                    "']"
                                ).attr("data-default");
                                filterDesignations(subcat, "tag", def);
                            }
                        } else if (des) {
                            setCategories("default");
                            console.log("setCategories D location");
                            filterDesignations(des, "search", des);
                        } else if (urlSearch) {
                            setCategories("default");
                            console.log("setCategories E location");

                            // 1. Get the select element
                            const selectElement = document.getElementById("categoryList");

                            // 2. Set the desired value programmatically
                            selectElement.selectedIndex = 5;

                            // 3. Dispatch the change event
                            // The 'bubbles: true' option allows the event to bubble up the DOM tree, which is often necessary 
                            // for frameworks or other event listeners to detect it.
                            selectElement.dispatchEvent(new Event("change", { bubbles: true }));

                            const selectSearchElement = document.getElementById("designationSearch");
                            selectSearchElement.dispatchEvent(new Event("change", { bubbles: true }));

                            // filterDesignations(urlSearch, "search");
                        } else if (cat) {
                            // This should be run if a category is sent, but no subcategory.  Should work for all four categories.
                            // updateCategories(cat);
                            setCategories(cat);
                            console.log("setCategories F location");
                        } else if (area) {
                            // Change area based on "area" URL parameter
                            setCategories("default");
                            let areaSelectValue = area.toLowerCase();
                            const selectElement = document.getElementById("categoryList");
                            selectElement.value = areaSelectValue;
                            selectElement.dispatchEvent(new Event("change", { bubbles: true }));

                            if (unit) {
                                console.log("unit: " + unit);
                                var startsWithValue = unit;
                                $('#collegeunitList option[value^="' + startsWithValue + '"]').prop("selected", true);
                                $('#collegeunitList').change(); 
                                let selectCollegeUnitValue = document.getElementById("collegeunitList").value;
                                filterCollegeUnitDesignations(
                                    selectCollegeUnitValue,
                                    "tag",
                                    $("#categoryList option:selected").attr("data-default")
                                ); 
                            } else {
                                
                            }
                            
                        } else {
                            setCategories("default");
                            // Inital load of Areas to Support
                            // console.log("setCategories G location");
                            filterDesignations(
                                //"Unrestricted",
                                "999 - Others", // Unit Attribute\Value column
                                "tag",
                                "default"
                                // "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                                //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                            );
                        }
                        unblockForm($(".donationForm"));
                    } */
                    
                    // WebAPI functionality
                    var queryInstanceId = "b0e28c08-4081-4328-91f5-8509243f5d79";
                    var queryOptions = {
                        crossDomain: false 
                    };
                    var filters = [];
                    var queryService = new BLACKBAUD.api.QueryService(queryOptions);

                    querySuccess = function(obj) {
                        designationArray = [];
                        designationSearchArray = [];
                        fuseSearchArray = [];
                        for (var i = 0; i < obj.Rows.length; i++) {
                            var tempArray = [
                                obj.Rows[i].Values[0],
                                obj.Rows[i].Values[1],
                                obj.Rows[i].Values[2],
                                obj.Rows[i].Values[3],
                                obj.Rows[i].Values[4],

                                obj.Rows[i].Values[5],
                                obj.Rows[i].Values[6],
                                obj.Rows[i].Values[7],
                                obj.Rows[i].Values[8],
                                obj.Rows[i].Values[9]
                            ];
                            
                            var tempSearchArray = [
                                obj.Rows[i].Values[0],  // Fund with finder number
                                obj.Rows[i].Values[4],  // Fund description
                                obj.Rows[i].Values[6],  // Fund GUID
                            ];

                            fuseSearchArray.push({
                                value: obj.Rows[i].Values[6],
                                label: obj.Rows[i].Values[0],
                                cat: obj.Rows[i].Values[8],
                                subcat: obj.Rows[i].Values[9]
                            })

                            if (i > 1 && obj.Rows[i].Values[0] == obj.Rows[i - 1].Values[0]) {
                                designationArray.push(tempArray);
                                // designationSearchArray.push(tempSearchArray);
                                // designationArray[designationArray.length - 1].push(obj.Rows[i].Values[4]);
                            } else {
                                designationArray.push(tempArray);
                                designationSearchArray.push(tempSearchArray);
                            }
                        }

                        // console.log("designationArray");
                        // console.log(designationArray);
                        // console.log("fuseSearchArray");
                        // console.log(fuseSearchArray);

                        fuseSearch(fuseSearchArray.sort());

                        // sort array results and remove duplicates
                        var sortedArray = designationArray.sort(compare);
                        var tidiedArray = [];
                        // console.log(sortedArray); // ALL FUNDS

                        // alternate designation process:
                        // - create second array (tidiedArray)
                        // - loop through first array and
                        // -- push funds that aren't already in the array
                        // -- if they are already in the array, push the tag
                        for (var i = 0; i < sortedArray.length; i++) {
                            if (tidiedArray.indexOf(sortedArray[i]) < 0) {
                                tidiedArray.push(sortedArray[i]);
                            }
                        }

                        // for (var i = 0; i < sortedArray.length - 1; i++) {
                        //     // need a way to check more than just the next, or previous, fund
                        //     // for each fund, loop through the upcoming funds until the name does 
                        //     // NOT match the current name - grab and push the tags and delete the funds

                        //     if (sortedArray[i][0] == sortedArray[i + 1][0]) {
                        //         sortedArray[i + 1].push(sortedArray[i][3]);
                        //         sortedArray.splice(i, 1);
                        //     }
                        // }
                        // designationArray = sortedArray;
                        // console.log(sortedArray); // FILTERED FUNDS

                        // Generate option elements for designation selectors, based on designationArray
                        for (var i = 0; i < designationArray.length; i++) {
                            var otherDes = document.getElementById("designationId");
                            var otherOpt = document.createElement("option");
                            otherOpt.value = designationArray[i][1];
                            otherOpt.innerHTML =
                                designationArray[i][0] + " - " + designationArray[i][2];
                            otherOpt.setAttribute("data-description", designationArray[i][4]);
                            otherDes.appendChild(otherOpt);
                        }
                        if (subcat) {
                            // *** add des filter.  It should fail gracefully, if fund isn't found...
                            // updateCategories(cat, subcat);
                            setCategories(cat, subcat);
                            // console.log("setCategories C location");
                            if (des) {
                                filterDesignations(subcat, "tag", des);
                            } else {
                                var def = $(
                                    "#categoryList option[value='" +
                                    subcat.toLowerCase().replace(/[\'\"]/g, "") +
                                    "']"
                                ).attr("data-default");
                                filterDesignations(subcat, "tag", def);
                            }
                        } else if (des) {
                            setCategories("default");
                            // console.log("setCategories D location");
                            filterDesignations(des, "search", des);
                        } else if (urlSearch) {
                            setCategories("default");
                            // console.log("setCategories E location");

                            // 1. Get the select element
                            const selectElement = document.getElementById("categoryList");

                            // 2. Set the desired value programmatically
                            selectElement.selectedIndex = 5;

                            // 3. Dispatch the change event
                            // The 'bubbles: true' option allows the event to bubble up the DOM tree, which is often necessary 
                            // for frameworks or other event listeners to detect it.
                            selectElement.dispatchEvent(new Event("change", { bubbles: true }));

                            const selectSearchElement = document.getElementById("designationSearch");
                            selectSearchElement.dispatchEvent(new Event("change", { bubbles: true }));

                            // filterDesignations(urlSearch, "search");
                        } else if (cat) {
                            // This should be run if a category is sent, but no subcategory.  Should work for all four categories.
                            // updateCategories(cat);
                            setCategories(cat);
                            // console.log("setCategories F location");
                        } else if (area) {
                            // Change area based on "area" URL parameter
                            setCategories("default");
                            let areaSelectValue = area.toLowerCase();
                            const selectElement = document.getElementById("categoryList");
                            selectElement.value = areaSelectValue;
                            selectElement.dispatchEvent(new Event("change", { bubbles: true }));

                            if (unit) {
                                console.log("unit: " + unit);
                                var startsWithValue = unit;
                                $('#collegeunitList option[value^="' + startsWithValue + '"]').prop("selected", true);
                                $('#collegeunitList').change(); 
                                let selectCollegeUnitValue = document.getElementById("collegeunitList").value;
                                filterCollegeUnitDesignations(
                                    selectCollegeUnitValue,
                                    "tag",
                                    $("#categoryList option:selected").attr("data-default")
                                ); 
                            } else {
                                
                            }
                            
                        } else {
                            setCategories("default");
                            // Inital load of Areas to Support
                            // console.log("setCategories G location");
                            filterDesignations(
                                //"Unrestricted",
                                "999 - Others", // Unit Attribute\Value column
                                "tag",
                                "default"
                                // "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                                //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                            );
                        }
                        unblockForm($(".donationForm"));
                    };
                    queryFailure = function(obj) {
                        unblockForm($(".donationForm"));
                    };
                    var queryResults = queryService.getResults(
                        queryInstanceId,
                        querySuccess,
                        queryFailure,
                        filters
                    );
                }

                function setValidationMessage(html) {
                    //console.log("setValidationMessage");
                    $(".validation").html(html);
                    $("html, body").animate({
                            scrollTop: $(".validation").offset().top - 200
                        },
                        "fast"
                    );
                }

                function convertErrorToString(error) {
                    /*  Possible errors - might help to have cases for all:
                    
                        RecordNotFound (106)
                        RequiredFieldMissing (101)
                        InvalidFieldSupplied (102)
                        ValueBelowMinimum (103)
                        ValueExceedsMaximum (104)
                        ValueNotAllowed (105)
                        ExceedsMaximumLength (107)*/

                    if (error) {
                        if (error.Message) return error.Message;
                        switch (error.ErrorCode) {
                            case 101:
                                return error.Field + " is required.";
                            case 102:
                                return error.Field + " is not valid.";
                            case 103:
                                return error.Field + " is below the minimum required.";
                            case 104:
                                return error.Field + " is above the maximum value.";
                            case 105:
                                return error.Field + " is not valid.";
                            case 106:
                                return "Record for " + error.Field + " was not found.";
                            case 107:
                                return error.Field + " exceeds the maximum character length.";
                            case 203:
                                var url =
                                    location.protocol +
                                    "//" +
                                    location.hostname +
                                    (location.port ? ":" + location.port : "") +
                                    location.pathname;
                                return (
                                    '<p>The donation was not completed. Click the link below to return to the donation form:</p><p><a href="' +
                                    url +
                                    '">' +
                                    url +
                                    "</a></p>"
                                );
                            default:
                                return "Error code " + error.ErrorCode + ".";
                        }
                    }
                }

                function convertErrorsToHtml(errors) {
                    var i,
                        message = "Unknown error.<br/>";
                    if (errors) {
                        message = "";
                        for (i = 0; i < errors.length; i++) {
                            message = message + convertErrorToString(errors[i]) + "<br/>";
                        }
                    }
                    return message;
                }

                function validateEmail(email) {
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                }

                function validatePhone(phone) {
                    if (phone) {
                        var re = /^[0-9 \+\)\(\-]{6,20}\s?((([xX]|[eE][xX][tT])\.?\s*(\d+))*)$/;
                        return re.test(phone);
                    } else {
                        return false; // Was 'return true'. Changed to 'return false' to get it to work.
                    }
                }

                function blockForm(element) {
                    if (!blocked) {
                        BLACKBAUD.api.blockElement(element);
                        // $('.blockMsg').html('<p>Funds loading...</p>');
                        blocked = true;
                    }
                }

                function unblockForm(element) {
                    BLACKBAUD.api.unblockElement(element);
                    blocked = false;
                }

                function fuseSearch(fundArray) {
                    // console.log("fundArray");
                    // console.log(fundArray);

                    const options = {
                        keys: ["label"],
                        minMatchCharLength: 2,
                        threshold: 0.3,  // Adjust the threshold to control fuzziness
                        ignoreLocation: true
                    };

                    const fuse = new Fuse(fundArray, options);
                    // console.log("fuse");
                    // console.log(fuse); 

                    const typeaheadInput = $("#designationSearch");

                    var header = function (context) {
                        $("#designationSearchCount")
                        $("#designationSearchCount").text(" (" + context.suggestions.length + " results found)");
                        // calculate total hits here
                        return;
                        // return "<p><b>" + context.suggestions.length + "</b> results</p>";
                    }

                    // var typeaheadInit = search.initialize();
                    // typeaheadInit.done(function() {
                        typeaheadInput.typeahead({
                            highlight: true,
                            minLength: 2
                        }, {
                            display: 'label',
                            name: 'search',
                            source: function (query, syncResults) {
                                const results = fuse
                                    .search(query)
                                    .map((result) => result.item);
                                syncResults(results);
                            },
                            limit: 'Infinity',
                            templates: {
                                empty: function() {
                                    return '<div class="no-match">No results found</div>';
                                },
                                suggestion: function(data) {
                                    var categoryText = "";

                                    if (data.cat) {
                                        categoryText = data.cat + ' / ';
                                    } else {
                                        // categoryText
                                    }
                                    return '<div><p class="tt-label">' + data.label + '</p></div>';

                                    // Select dropdown
                                    // return '<option>' + data.label + '</option>';
                                    // return '<div><p class="tt-label">' + data.label + '</p></div>';
                                    // return '<div><p class="tt-hierarchy">' + categoryText + data.subcat.substring(data.subcat.indexOf("-") + 1).trim() + '</p><p class="tt-label">' + data.label + '</div>';
                                    // return '<div><p class="tt-hierarchy">' + data.cat + ' / ' + data.subcat + '</p><p class="tt-label">' + data.label + '</div>';
                                },
                                header: header
                            }
                        }).on('typeahead:select', function(e, datum) {
                            $(this).data({
                                value: datum.value,
                                label: datum.label,
                                cat: datum.cat,
                                subcat: datum.subcat,
                                id: datum.value + '-' + datum.label.replace(/(_|\W)/g, '').toLowerCase()
                            });

                            var fundSelector = document.getElementById("designationId");
                            fundSelector.innerHTML = "";

                            var opt = document.createElement("option");
                            opt.value = $(this).data("value");
                            opt.innerHTML = $(this).data("label");
                            fundSelector.appendChild(opt);

                            $("#designationCount").text(" (1 result found)");
                            // $(".designation-select").show(); 

                            // BBI.Methods.addFund($(this)); // remove for this giving form
                            // clearSearch();
                        }).on("typeahead:change", function() {
                            if ($.trim($(this).typeahead("val")) === "") {
                                $("#designationSearchCount").text("");
                                clearSearch();
                            }
                        });
                        
                    // }).fail(function() {
                    //     console.log("unable to parse designation query");
                    // });

                    // clear search field
                    function clearSearch() {
                        typeahead.typeahead("val", "").typeahead("close");
                        typeahead.removeData();
                    }
                    
                }

                function fundSearchStepped() {
                    // console.log("fundSearchStepped");

                    var queryInstanceId = "b0e28c08-4081-4328-91f5-8509243f5d79";
                    
                    // typeahead variables
                    var typeahead = $("#designationSearch"),
                        query = new BLACKBAUD.api.QueryService(),
                        results = [];

                    // console.log(data);

                    // get results
                    query.getResults(queryInstanceId, function(data) {
                        // clean results
                        results = [];
                        var fields = data.Fields,
                            rows = data.Rows,
                            fieldArray = [];

                        $.each(fields, function(key, value) {
                            fieldArray[value.Name] = key;
                        });

                        $.each(rows, function() {
                            var values = this.Values;
                            results.push({
                                value: values[6],       // GUID
                                label: values[1],       // Path
                                cat: values[8],         // BBIS Fund Category - Multi Attribute\Value
                                subcat: values[9]       // Unit Attribute\Value
                                // value: values[4],
                                // label: values[3],
                                // cat: values[1],
                                // subcat: values[2]
                            });
                        }).sort((a, b) => a.label - b.label);

                        function removeDuplicatesByKey(array, key) {
                            // Create a Map to store unique objects, using the key's value as the Map's key.
                            // The Map will automatically overwrite duplicates, keeping the last one by default.
                            const uniqueMap = new Map();
                            array.forEach(item => {
                                uniqueMap.set(item[key], item);
                            });
                            
                            // Convert the Map values back to an array
                            return Array.from(uniqueMap.values());
                        }

                        const uniqueArray = removeDuplicatesByKey(results, 'label');
                        // console.log(uniqueArray);

                        var search = new Bloodhound({
                            // datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label', 'cat', 'subcat'),
                            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
                            queryTokenizer: Bloodhound.tokenizers.whitespace,
                            local: uniqueArray
                        });

                        var header = function (context) {
                            $("#designationSearchCount")
                            $("#designationSearchCount").text(" (" + context.suggestions.length + " results found)");
                            // calculate total hits here
                            return;
                            // return "<p><b>" + context.suggestions.length + "</b> results</p>";
                        }

                        // initialize typeahead plugin
                        var typeaheadInit = search.initialize();
                        typeaheadInit.done(function() {
                            typeahead.typeahead({
                                highlight: true,
                                minLength: 2
                            }, {
                                display: 'label',
                                name: 'search',
                                source: search,
                                limit: 'Infinity',
                                templates: {
                                    empty: function() {
                                        return '<div class="no-match">No results found</div>';
                                    },
                                    suggestion: function(data) {
                                        var categoryText = "";

                                        if (data.cat) {
                                            categoryText = data.cat + ' / ';
                                        } else {
                                            // categoryText
                                        }
                                        return '<div><p class="tt-label">' + data.label + '</p></div>';

                                        // Select dropdown
                                        // return '<option>' + data.label + '</option>';
                                        // return '<div><p class="tt-label">' + data.label + '</p></div>';
                                        // return '<div><p class="tt-hierarchy">' + categoryText + data.subcat.substring(data.subcat.indexOf("-") + 1).trim() + '</p><p class="tt-label">' + data.label + '</div>';
                                        // return '<div><p class="tt-hierarchy">' + data.cat + ' / ' + data.subcat + '</p><p class="tt-label">' + data.label + '</div>';
                                    },
                                    header: header
                                }
                            }).on('typeahead:select', function(e, datum) {
                                $(this).data({
                                    value: datum.value,
                                    label: datum.label,
                                    cat: datum.cat,
                                    subcat: datum.subcat,
                                    id: datum.value + '-' + datum.label.replace(/(_|\W)/g, '').toLowerCase()
                                });

                                var fundSelector = document.getElementById("designationId");
                                fundSelector.innerHTML = "";

                                var opt = document.createElement("option");
                                opt.value = $(this).data("value");
                                opt.innerHTML = $(this).data("label");
                                fundSelector.appendChild(opt);

                                $("#designationCount").text(" (1 result found)");
                                // $(".designation-select").show(); 

                                // BBI.Methods.addFund($(this)); // remove for this giving form
                                // clearSearch();
                            }).on("typeahead:change", function() {
                                if ($.trim($(this).typeahead("val")) === "") {
                                    $("#designationSearchCount").text("");
                                    clearSearch();
                                }
                            });
                        }).fail(function() {
                            console.log("unable to parse designation query");
                        });

                        // clear search field
                        function clearSearch() {
                            typeahead.typeahead('val', '').typeahead('close');
                            typeahead.removeData();
                        }

                        // autopopulate designation from url
                        var guid = BBI.Methods.returnQueryValueByName('fund');
                        if (!!guid) {
                            var label = results.filter(function(obj) {
                                return obj.value === guid;
                            })[0].label;
                            typeahead.data('value', guid).typeahead('val', label);
                        }
                    });
                }

                function resetFundDropdown() {
                    const desId = document.getElementById("designationId");
                    var defaultArea = document.createElement("option");
                    desId.innerHTML = "";
                    defaultArea.value = "";
                    defaultArea.selected = true;
                    defaultArea.disabled = true;
                    defaultArea.innerHTML = "Choose a fund";
                    desId.appendChild(defaultArea);
                }

                /* End helper functions */

                /* Set up form */
                
                // Attach our event listener to the donate button
                $(".btn-donate").click(function(e) {
                    // Stop the button from submitting the form
                    e.preventDefault();
                    setValidationMessage("");

                    if (myGift.validate(3)) {
                        // if ($('#donation-form.payroll').length !== 0) {
                        //     stepUpdate(myGift, 5);
                        // } else {
                        //     stepUpdate(myGift, 4);
                        // }

                        stepUpdate(myGift, 4);
                        
                        myGift.updateAttributes();

                        sendData();

                        // BBI.Methods.getDonationData();
                    }
                });

                // $(".designation-categories a").on("click", function(e) {
                //     e.preventDefault();
                //     updateCategories(e);
                // });

                /* $("#designationSearch").on("keyup", function(e) {
                    var txt = $(this).val();
                    // console.log(txt);
                    // if (e.which == 13) {
                        e.preventDefault();
                        if (txt != "" && txt.length > 2) filterSearchDesignations(txt, "search");
                    // }
                });

                $("#designationSearch").on("change", function(e) {
                    var txt = $(this).val();
                    // console.log(txt);
                    e.preventDefault();
                    if (txt != "" && txt.length > 2) filterSearchDesignations(txt, "search");
                }); */

                $("#designationSearch").on("keyup change", function(e) {
                    var txt = $(this).val();
                    // console.log(txt);
                    e.preventDefault();
                    if (txt == "") {
                        $("#designationSearchCount").text("");
                    }
                });

                // $("#designationSearchBtn").on("click", function(e) {
                //     var txt = $("#designationSearch").val();
                //     e.preventDefault();
                //     if (txt != "") filterDesignations(txt, "search");
                // });

                // when designation selector changes, run function to set description
                $(".designations").on("change", function(e) {
                    // setDescription();
                    $(".validation-message").remove();
                });

                // Amount functionality
                $(".amounts a, .amounts .otherAmt").on("click", function(e) {
                    e.preventDefault();
                    $(".amounts a, .amounts .otherAmt, .amounts input").removeClass("selected");
                    $(this).addClass("selected");

                    // if it's 'other', add 'selected' class to input and give that input focus
                    if ($(this).hasClass("otherAmt")) {
                        $(this).find("> input").addClass("selected").focus().select();
                        // $("#otherAmtInstr").show();
                        $(".validation-message").hide();
                    } else {
                        $(".amounts #otherAmtInput").val($(this).attr("data-value"));
                        // $("#otherAmtInstr").hide();
                    }
                });

                // $(".gift-count-indicator").on("click", function() {
                //     if (parseInt($(".gift-count").text()) > 0) {
                //         stepUpdate(myGift, 2);
                //     } else {}
                // });

                // Continue forward to INFORMATION step (PAYROLL step for Faculty/Staff form)
                $("#cancelAddLineItem").on("click", function() {
                    // If pledge payment is checked, validate that Pledge ID and Pledge amount are entered.
                    if ($(".gift-type a#Pledge").hasClass("selected")) {
                        var pledgeIdcheck = $("#pledgeId").val();
                        var pledgeAmtcheck = $("#pledgeAmount").val();
                        $(".pledgeID-input .validation-message, .pledgeAmount-input .validation-message").remove();

                        if (pledgeIdcheck.length < 10 || pledgeAmtcheck == "") {
                            if (pledgeIdcheck == "") {
                                $(".pledgeID-input").append(
                                    '<div class="validation-message">Pledge ID is required.</div>'
                                );
                            } else if (pledgeIdcheck.length < 10) {
                                $(".pledgeID-input").append(
                                    '<div class="validation-message">Pledge ID is ten digits long.</div>'
                                );
                            } else {
                                $(".pledgeID-input .validation-message").remove();
                            }

                            if (pledgeAmtcheck == "") {
                                $(".pledgeAmount-input").append(
                                    '<div class="validation-message">Gift amount is required.</div>'
                                );
                            } else {
                                $(".pledgeAmount-input .validation-message").remove();
                            }
                            
                        } else {
                            stepUpdate(myGift, 2);
                            const links = document.querySelectorAll("p.step1-link");

                            // Loop through each link and hide it
                            links.forEach(link => {
                                link.style.display = "none"; 
                            });
                            
                        }
                    } else if ($(".gift-type a#Monthly").hasClass("selected") || $(".gift-type a#One-Time").hasClass("selected")) {
                        stepUpdate(myGift, 2);
                        const links = document.querySelectorAll("p.step1-link");

                        // Loop through each link and hide it
                        links.forEach(link => {
                            link.style.display = "none"; 
                        });
                    } else {
                        // do nothing
                    }

                    // stepUpdate(myGift, 2);
                });

                if ($('#donation-form.payroll').length !== 0) {
                    $("#continueToPayroll, #returnToPayroll").on("click", function() {
                        stepUpdate(myGift, 2);
                    });

                    $("#continueToYourInfo, #returnToYourInfo").on("click", function() {
                        stepUpdate(myGift, 3);
                    });                    
                } else {
                    $("#continueToYourInfo").on("click", function() {
                        stepUpdate(myGift, 3);
                    });
                }

                // $("#returnToGiftDetail, .add-gift").on("click", function() {
                // Return back to INFORMATION step
                $("#returnToGiftDetail").on("click", function() {
                    // If a designation is passed in the URL, load that, else load default
                    if (urlSearch) {
                        // updateCategories("search");
                        filterDesignations(urlSearch, "search");
                    } else if (des) {
                        // updateCategories("search");
                        filterDesignations(des, "search");
                    } else {
                        // setCategories("default");
                        // console.log("setCategories H location");
                        filterDesignations(
                            //"Unrestricted",
                            "999 - Others",
                            "tag",
                            "default"
                            // "bec20fdc-0e79-42ae-b353-b5b46c02f73e"
                            //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                        );
                    }
                    stepUpdate(myGift, 2);
                });

                // $(".add-gift").on("click", function() {
                //     // If a designation is passed in the URL, load that, else load default
                //     if (urlSearch) {
                //         filterDesignations(urlSearch, "search");
                //     } else if (des) {
                //         filterDesignations(des, "search");
                //     } else {
                //         setCategories("default");
                //         console.log("setCategories I location");
                //         // updateCategories("school");
                //         filterDesignations(
                //             //"Unrestricted",
                //             "999 - Others",
                //             "tag",
                //             "default"
                //             // "bec20fdc-0e79-42ae-b353-b5b46c02f73e"
                //             //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                //         );
                //     }
                //     stepUpdate(myGift, 1);
                // });

                $("#designationId").change(function() {
                    var newdesignationId = $(this).val();
                    
                    if (newdesignationId !== "") {
                        if (newdesignationId == "search fund by name") {
                            const categoryListDropdown = document.getElementById("categoryList");
                            categoryListDropdown.value = "search fund by name";
                            $(".designation-select, .collegeunit-select").hide();
                            $(".designationSearch-select").show();
                            document.getElementById("designationSearch").focus();

                            var desId = document.getElementById("designationId");
                            desId.options.length = 1;
                            $("#designationCount").text("");
                        } else {
                            // Do nothing
                            // setDescription();
                        }
                    }                    
                });

                // Return back to GIFT step
                $("#returnToReview").on("click", function() {
                    stepUpdate(myGift, 1);
                    const links = document.querySelectorAll("p.step1-link");

                    // Loop through each link and hide it
                    links.forEach(link => {
                        link.style.display = "block"; 
                    });
                    // stepUpdate(myGift, 2);
                });

                // Return back to PAYROLL step
                $("#returnToPayroll").on("click", function() {
                    stepUpdate(myGift, 2);
                });

                // Continue forward to TRIBUTE step
                $("#continueToTribute").on("click", function() {
                    stepUpdate(myGift, 4);
                });

                // $(".breadcrumbs a").on("click", function(e) {
                //     e.preventDefault();
                //     stepUpdate(myGift, $(this).attr("data-step"));
                // });

                $("#dtd-select-menu > div").on("click", function() {
                    // e.preventDefault();
                    console.log("start: update link text");
                    $("span.wrongcompany > a").text("Select a different company/Remove selection");
                    console.log("end: update link text");
                });

                $("#categoryList").change(function() {
                    var categoryListSelection = $(this).val();

                    if (categoryListSelection == "colleges/units") {
                        $(".collegeunit-select").slideToggle();
                        $(".designation-select").hide();
                        $(".designationSearch-select").hide();
                        filterCollegesUnits(
                            $(this).val(),
                            "tag",
                            $("#categoryList option:selected").attr("data-default")
                        );
                        document.getElementById("collegeunitList").focus();

                        resetFundDropdown();
                    } else if (categoryListSelection == "29 - athletics and ucats") {
                        $(".designation-select").show();
                        $(".collegeunit-select").hide();
                        $(".designationSearch-select").hide();

                        resetFundDropdown();

                        filterCollegeUnitDesignations(
                            "29 - Athletics and UCATS",
                            "tag",
                            $("#categoryList option:selected").attr("data-default")
                        ); 

                        document.getElementById("designationId").focus();
                        
                    } else if(categoryListSelection == "search fund by name") {
                        // Show typeahead search; Hide Area to Support
                        $(".designationSearch-select").slideToggle();
                        $(".designation-select").hide();
                        $(".collegeunit-select").hide();
                        var designationSearch = document.getElementById("designationSearch");
                        designationSearch.value = "";

                        var desId = document.getElementById("designationId");
                        desId.options.length = 1;
                        $("#designationCount").text("");
                        document.getElementById("designationSearch").focus();
                    } else if(categoryListSelection == "default") {
                        const desId = document.getElementById("designationId");
                        desId.options.length = 1;
                        $("#designationCount").text("");
                        // $("#designationCount").text(" (0 results found)");
                        $(".collegeunit-select, .designation-select").hide();
                        $(".designationSearch-select").hide();

                        resetFundDropdown();
                    } else {
                        $(".designation-select").show();
                        $(".collegeunit-select").hide();
                        $(".designationSearch-select").hide();

                        resetFundDropdown();
                        filterDesignations(
                            $(this).val(),
                            "tag",
                            $("#categoryList option:selected").attr("data-default")
                        );
                        document.getElementById("designationId").focus();
                    }
                    
                    $("#designationSearchCount").text("");
                    $("#desDescrText").text("");
                    $("#designationDescription").hide();
                    $("#designationSearch").typeahead("val", "");
                    // $("#designationSearch").val("");
                });

                $("#collegeunitList").change(function() {
                    $("#designationSearchCount").text("");
                    var collegeUnitListSelection = $(this).val();
                    if (collegeUnitListSelection == "search fund by name") {
                        const categoryListDropdown = document.getElementById("categoryList");
                        categoryListDropdown.value = "search fund by name";
                        $(".collegeunit-select, .designation-select").hide();
                        $(".designationSearch-select").show();
                        document.getElementById("designationSearch").focus();

                        var desId = document.getElementById("designationId");
                        desId.options.length = 1;
                        $("#designationCount").text("");
                    } else {
                        filterCollegeUnitDesignations(
                            $(this).val(),
                            "tag",
                            // $("#collegeunitList option:selected").attr("value")
                            $("#categoryList option:selected").attr("data-default")
                        ); 
                        $(".designation-select").show();
                        document.getElementById("designationId").focus();
                    }                                    
                });

                $(".donationForm").change(function() { // ".form"
                    myGift.update();
                });

                $(".addLineItem").click(function(e) {
                    e.preventDefault();

                    var id = $(".designations .designationId option:selected").val();
                    var name = $(".designations .designationId option:selected").text();
                    var descr = "";
                    var amount = 0;
                    if ($(".designations #otherAmtInput").hasClass("selected")) {
                        amount = $(".designations #otherAmtInput").val();
                        amount = amount.toString();
                        amount = amount.replace(/[,$]+/g, "");
                        amount = parseFloat(amount);
                    } else {
                        amount = $(".designations .amount.selected").attr("data-value");
                    }

                    // if ($("#designationId option:selected").attr("data-other") == "true") {
                    //     descr = $("#otherDesignationInput").val();
                    // } else {
                    //     descr = "";
                    // }
                    // console.log(name); 
                    myGift.addLineItem(amount, id, name, descr);
                });

                $(".gift-type a").on("click", function(e) {
                    e.preventDefault();
                    giftTypeUpdate(e);
                });

                $("#frequency").change(function() {
                    var amountFrequencyText = $("#lineItems .line-item.total").text();
                    var myArray = amountFrequencyText.split(" ");
                    var allButLast = myArray.slice(0, -1);
                    myString = allButLast.join(" ");

                    var frequencyVal = $("#frequency").val();
                    var newFrequencyText = "";
                    if (frequencyVal == "2") {
                        newFrequencyText = "Monthly";
                    } else {
                        newFrequencyText = "Quarterly";
                    }
                    $("#lineItems .line-item.total").text(myString + " " + newFrequencyText);
                });

                if ($("#donation-form.payroll").length !== 0) {
                    const installmentInput = document.getElementById("numberOfInstallments");
                    
                    function handleInstallmentChange(event) {
                        const installmentsField = document.getElementById("numberOfInstallments");
                        const min = parseFloat(installmentsField.min);
                        const max = parseFloat(installmentsField.max);
                        const value = parseFloat(installmentsField.value);

                        // if (value > max) installmentsField.value = max;
                        // if (value < min) installmentsField.value = min;
                        
                        if (installmentsField.value.trim() !== "") {
                            var numberOfInstallments = $(this).val(),
                                n1 = $("#totalGift").val(),
                                n2 = $("#numberOfInstallments").val(),
                                regp = /[^0-9.-]+/g,
                                formatter = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                });
                            // console.log(numberOfInstallments);

                            var installmentAmount = parseFloat(n1.replace(regp, '')) / parseFloat(n2.replace(regp, ''));
                            installmentAmount = parseFloat(installmentAmount, 10).toFixed(2);
                            $("#installmentAmount").val(formatter.format(installmentAmount));
                        }
                    }

                    installmentInput.addEventListener("input", handleInstallmentChange);

                    // Select all radio buttons with the name "pay_period"
                    const payPeriodButtons = document.querySelectorAll('input[name="pay_period"]');

                    // Loop through each radio button and attach the event listener
                    payPeriodButtons.forEach(radio => {
                        radio.addEventListener("change", (event) => {
                            // Check if the current radio button is the one being selected
                            if (event.target.checked) {
                                const selectedValue = event.target.value;
                                const maximumPayPeriodsField = document.querySelector(".maximumPayPeriods");
                                const installmentInputMax = document.getElementById('numberOfInstallments');
                                if (selectedValue == "Monthly") {
                                    maximumPayPeriodsField.textContent = "Maximum of 12 pay periods.";
                                    installmentInputMax.max = 12;
                                    document.getElementById("numberOfInstallments").value = 1;
                                } else {
                                    maximumPayPeriodsField.textContent = "Maximum of 26 pay periods.";
                                    installmentInputMax.max = 26;
                                    document.getElementById("numberOfInstallments").value = 1;
                                }
                                const giftValue = document.getElementById("totalGift").value;
                                document.getElementById("installmentAmount").value = giftValue;
                            }
                        });
                    });
                }

                // Event handlers for joint gift checkbox
                $("#isJointGift").change(function() {
                    if (this.checked) {
                        $("#jointGiftInfoSub").show();
                        $("#spouse").focus();
                    } else {
                        $("#isJointGift").prop("checked", false);
                        $("#jointGiftInfoSub").hide();
                    }
                });

                // Event handlers for joint gift checkbox
                $("#matchingGift").change(function() {
                    if (this.checked) {
                        $("#matchingGiftInfoSub").show();
                        $("#dd-input").focus();
                    } else {
                        $("#matchingGift").prop("checked", false);
                        $("#matchingGiftInfoSub").hide();
                    }
                });

                // Event handlers for corporate/company gift checkbox
                $("#corporateGift").change(function() {
                    if (this.checked) {
                        $("#corporateGiftInfoSub").show();
                        $("#companyName").focus();
                    } else {
                        $("#corporateGift").prop("checked", false);
                        $("#corporateGiftInfoSub").hide();
                    }
                });

                // Event handlers for tribute/acknowledgee checkboxes
                $("#tributeCheckbox").change(function() {
                    if (this.checked) {
                        $("#tributeInfoSub").show();
                        $("#ddlTribute").focus();
                        // if (!$("#chkAcknowledge").attr("checked") && !hideack)
                        // $("#chkAcknowledge").click();
                    } else {
                        $("#tributeCheckbox").prop("checked", false);
                        $("#tributeInfoSub").hide();
                        $("#acknowledgeeInfoSub").hide();
                    }
                });

                $("#chkAcknowledge").change(function() {
                    if (this.checked) {
                        $("#acknowledgeeInfoSub").show();
                        $("#txtAcknowledgeeFirstName").focus();
                        // $("#acknowledgeeState option[value='OH']").attr("selected", "selected");
                    } else {
                        $("#acknowledgeeInfoSub").hide();
                    }
                });

                $("#tributeCheckbox").change(function() {
                    if ($(this).prop("checked") == true && $(".gift-type a#Monthly").hasClass("selected")) {
                        // Since the Tribute section can't be filled out for a RECURRING gift, this
                        // will allow the user to enter Tribute information in a Tribute Description text field.
                        $("#tributeInfoSub").show();
                        $(".tribute-type, .tribute-name, .tribute-ack").addClass("hide");
                                  
                        $(".tribute-instr-input").show();
                        // document.getElementById("tribute-desc-label").innerHTML = "Honoree first and and last name";
                        // document.getElementById("txtTributeDescription").placeholder = "Honoree first and and last name";
                    } else {
                        $(".tribute-instr-input").hide();
                        // document.getElementById("tribute-desc-label").innerHTML = "Special instructions";
                        // document.getElementById("txtTributeDescription").placeholder = "Special instructions";
                    }
                    myGift.displayLineItems();
                });

                $(".tributeDefinition .type").change(function() {
                    var typeTxt = $(this).val();
                    if (typeTxt.indexOf("pet") >= 0) {
                        $(".tributeDefinition .firstName").val("");
                        $(".tributeDefinition .tribute-fname-input").hide();
                        $(".tributeDefinition .tribute-lname-label").text("Pet's name:");
                    } else {
                        $(".tributeDefinition .tribute-fname-input").show();
                        $(".tributeDefinition .tribute-lname-label").text("Last name:");
                    }
                });

                /* end setup */
            }
            if ($("#advancedDonationForm").length !== 0) {

                setTimeout(function() {
                    //highlight query param amount
                    $('.amountButton a').each(function() {
                        var currentButtonText = $(this).html();
                        if (currentButtonText.charAt(0) === '$') {
                            currentButtonText = currentButtonText.slice(1);
                            // console.log("currentButtonText= " + currentButtonText);
                        }
                        if (BBI.Methods.getUrlVars().amount == currentButtonText) {
                            $(this).addClass('selected');
                            $('#txtAmount').css('color', 'transparent');
                        }
                    });
                }, 300);

                //init the tabs
                BBI.Methods.initAdfTabs();

                //date pickers
                $('#startDate').datepicker();
                $('#endDate').datepicker({
                    changeMonth: true,
                    changeYear: true
                });

                //enter default 'greatest need' designation
                // $('#designationId').val(BBI.Defaults.greatestNeedFund);
                // $('.designationButton').first().find('a').attr('rel', BBI.Defaults.greatestNeedFund);

                //highlight clicked amounts
                $('.amountButton a').on('click', function() {
                    //highlight clicked amounts
                    $('.amountButton .selected').removeClass('selected');
                    $(this).addClass('selected');
                    $('#txtAmount').val($(this).attr('rel'));
                    $('#txtAmount').hide();
                    $('#adfOtherLabel').show();
                    $('.giftAmountError').remove();

                    //update display
                    var amount = $('.amountButton a.selected').attr('rel');
                    $('.adfTotalAmount span').html(amount);
                });

                $('#txtAmount').on('blur keyup', function() {
                    //update display
                    $('.adfTotalAmount span').html($('#txtAmount').val());
                });

                //reset when manually entering an amount
                $('#adfOtherLabel').on('click', function() {
                    $('.amountButton .selected').removeClass('selected');
                    $(this).hide();
                    $('#txtAmount').show().val('').focus();
                    $('.giftAmountError').remove();
                });

                //$('#designationAreaDropdown').on('change', function() {
                //    if ($(this).val() !== '-1') {
                //        $('.adfOtherDesignationSubSection').show('blind','slow');
                //    } else {
                //        $('.adfOtherDesignationSubSection').hide('blind','slow');
                //    }
                //});

                //progressive display toggles
                $('.checkboxToggle').on('change', function() {
                    var targetString = $(this).attr('data-controler');
                    var targetContent = $('#' + targetString);
                    if ($(this).attr('checked')) {
                        targetContent.show('blind', 'slow');
                    } else {
                        targetContent.hide('blind', 'slow');
                    }
                });

                //populate dynamic dropdowns
                BBI.Methods.populateCountryDropdowns();
                BBI.Methods.populateTitle();
                BBI.Methods.populateDesignationIds();
                BBI.Methods.populateCascadingFields();

                //other area text entry.
                $('.otherArea').on('click', function() {
                    $('#otherArea').focus();
                });

                $('#otherArea').on('blur', function() {
                    $('#designationId').val(BBI.Defaults.generalFreeFormFund);
                }).on('focus', function() {
                    $('.designationButton .selected').removeClass('selected');
                    $('#fundDesignation1').val('0');
                    $('#fundDesignation2').val('0').hide();
                });

                $('#adfSubmitButton').on('click', function(e) {
                    e.preventDefault();
                    if (BBI.Methods.validateADF()) {
                        $(this).addClass('disabled').unbind('click');
                        BBI.Methods.submitADF();
                    }
                });
            }
            if ($("#facultyStaff").length !== 0) {
                console.log("Faculty Staff Giving Form");
                // Faculty Staff Giving Form
                BBI.Methods.fundList();
                BBI.Methods.fundSearch();
                BBI.Methods.validationMarkers();
                BBI.Methods.giftOptions();
                BBI.Methods.getTitle();
                BBI.Methods.datePicker();
                BBI.Methods.calculateInstallments();
                BBI.Methods.populateCountryDropdowns();
                BBI.Methods.queryParameters();

                BBI.Methods.giftAmounts();

                setTimeout(function() {
                    //highlight query param amount
                }, 300);

                // legacy browser support for placeholder attributes
                // $('input:not(".tt-hint"), textarea').placeholder();

                // submit button event
                $('#adfSubmit').on('click', function(e) {
                    // prevent default action
                    e.preventDefault();

                    // form validation
                    if ($('.fund-card.empty').is(':visible')) {
                        $('#adfError').html('<span class="fas fa-exclamation-circle"></span><p>Please select a fund from above and enter an amount.</p>');
                        $('#adfError').show();
                    } else if (BBI.Methods.validateADF1()) {
                        // hide error
                        $('#adfError').hide();

                        // get donation data
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        BBI.Methods.getDonationData1();
                        // var data = BBI.Methods.getDonationData();

                        // credit card or bill me later
                        // if (BBI.Defaults.editorContent && BBI.Defaults.editorContent.MACheckoutSupported && data.Gift.PaymentMethod === 0) {
                        //     BBI.Methods.processCCPayment(data);
                        // } else {
                        //     BBI.Methods.billMeLater(data);
                        // }
                    } else {
                        // reset error
                        $('#adfError').html('<span class="fas fa-exclamation-circle"></span><p>Some required information is missing. Form submission is disabled until all required information is entered.</p>');
                    }
                });
            }
            if ($("#donationForm").length !== 0) {
                // Main Giving Form
                console.log("Main Giving Form");

                BBI.Methods.fundList();
                BBI.Methods.fundSearch();
                BBI.Methods.validationMarkers();
                BBI.Methods.giftOptions();
                BBI.Methods.getTitle();
                BBI.Methods.datePicker();
                BBI.Methods.populateCountryDropdowns();
                BBI.Methods.queryParameters();

                BBI.Methods.giftAmounts();

                $('#additional input[type="checkbox"]').click(function() {
                    var inputValue = $(this).attr("value");
                    // console.log(inputValue);
                    $("." + inputValue).slideToggle();
                });

                $("#giftTypeSelect").on("change", function() {
                    // console.log($(this).val());
                
                    var giftTypeSelected = $(this).val();
                    if (giftTypeSelected == "One-Time") {
                        $("fieldset.toggle").addClass("hide");
                        $("fieldset.fundSelect").removeClass("hide");
                        $("fieldset#giftSummary").removeClass("hide");
                    } else if (giftTypeSelected == "Monthly") {
                        $("fieldset.Pledge.toggle").addClass("hide");
                        $("fieldset.Monthly.toggle, fieldset.fundSelect").removeClass("hide");
                        $("fieldset#giftSummary").removeClass("hide");
                    } else if (giftTypeSelected == "Pledge") {
                        $("fieldset.Monthly.toggle, fieldset.fundSelect").addClass("hide");
                        $("fieldset.Pledge.toggle").removeClass("hide");
                        $("fieldset#giftSummary").addClass("hide");
                    } else {
                    // do nothing 
                    }
                        
                });

                // character counter (comments)
                let commentsLength = $("textarea#comments").attr("maxLength"),
                    commentsTextArea = $("textarea#comments");

                var maxLength = commentsLength;
                commentsTextArea.keyup(function() {
                    var textlen = maxLength - $(this).val().length;
                    $('.char-counter span').text(textlen);
                });

                // Check for specific Appeal Code to Show Ornament field
                var checkAppealId = BBI.Methods.returnQueryValueByName("appeal");
                console.log(checkAppealId);
                if (checkAppealId == "570c2edf-c180-4f4f-8b27-4dcfc60c7699") {
                    console.log("true");
                    $("#ornament").css("display", "flex");
                } else {
                    console.log("false");
                    // do nothing
                }

                // $("#adfSubmitButton").on("click", function(e) {
                //     e.preventDefault();
                //     if (BBI.Methods.validateADF()) {
                //         $(this)
                //             .addClass("disabled")
                //             .unbind("click");
                //         BBI.Methods.gf2SubmitADF();
                //     }
                // });

                $("#toggleOtherFund").on("click", function() {
                    $(".toggleOtherFund").slideDown();
                    $("#otherArea").focus();
                })

                var d = new Date(),
                    day = d.getDate();

                function getMinDate() {
                    var date = new Date();
                    if (day > 15) {
                        date.setMonth(date.getMonth() + 1, 1);
                    } else if (day == 1) {
                        // set to current date
                    } else {
                        date.setDate(15);
                    }
                    return date;
                }
                $("#startDate").datepicker({
                    beforeShowDay: function(dt) {
                        return [
                            dt.getDate() == 1 || dt.getDate() == 15 ?
                            true :
                            false,
                        ];
                    },
                    minDate: getMinDate(),
                });
                $("#startDate").datepicker("setDate", getMinDate());

                // submit button event
                $('#adfSubmitButton').on('click', function(e) {
                    // prevent default action
                    e.preventDefault();

                    // form validation
                    if ($('.fund-card.empty').is(':visible')) {
                        $('#adfError').html('<span class="fa fa-exclamation-circle"></span><p style="vertical-align: middle;display: inline-block !important;">Please select a fund from above and enter an amount.</p>');
                        $('#adfError').show();
                    } else if (BBI.Methods.validateADF()) {
                        // hide error
                        $('#adfError').hide();

                        // get donation data
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        BBI.Methods.getDonationData();
                        // var data = BBI.Methods.getDonationData();

                        // credit card or bill me later
                        // if (BBI.Defaults.editorContent && BBI.Defaults.editorContent.MACheckoutSupported && data.Gift.PaymentMethod === 0) {
                        //     BBI.Methods.processCCPayment(data);
                        // } else {
                        //     BBI.Methods.billMeLater(data);
                        // }
                    } else {
                        // reset error
                        $('#adfError').html('<span class="fa fa-exclamation-circle"></span><p>Some required information is missing. Form submission is disabled until all required information is entered.</p>');
                    }
                });

                $("html, body").animate({
                    scrollTop: "0"
                });
            }
        },

        getDonationData: function() {
            // create donation object
            var partId = $(".BBDonationApiContainer").attr("data-partid"),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false,
                }),
                giftAmount = $("#custom-amount").val(),
                designationID = $("#designationId").val(),
                customAttributes = [],
                designationArray = [];
            var donation = {
                Gift: {
                    Designations: [],
                    IsAnonymous: false,
                    Attributes: [],
                    MerchantAccountId: BBI.Defaults.MerchantAccountId
                },
                Origin: {
                    PageId: BBI.Defaults.pageId,
                    PageName: 'Giving Form V2'
                },
            };

            let billingtitle = $('#personalTitle option:selected').text().trim(),
                firstName = $('#personalFirstName').val(),
                lastName = $('#personalLastName').val(),
                address = $('#personalAddress').val(),
                addresstype = $('#personalAddressType option:selected').val(),
                country = $('#personalCountry option:selected').text().trim(),
                city = $('#personalCity').val(),
                state = $('#personalState option:selected').val(),
                zipcode = $('#personalZip').val(),
                phone = $('#personalPhone').val(),
                emailaddress = $('#personalEmail').val(),
                emailaddresstype = $('#personalEmailType option:selected').val(),
                pledgeIdValue = $("#pledgeId").val(),
                pledgeAmountValue = $("#pledgeAmount").val();

            localStorage.setItem("billingtitle", billingtitle);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("lastName", lastName);
            localStorage.setItem("address", address);
            localStorage.setItem("addresstype", addresstype);
            localStorage.setItem("address", address);
            localStorage.setItem("country", country);
            localStorage.setItem("city", city);
            localStorage.setItem("state", state);
            localStorage.setItem("zipcode", zipcode);
            localStorage.setItem("phone", phone);
            localStorage.setItem("emailaddresstype", emailaddresstype);
            localStorage.setItem("emailaddress", emailaddress);

            if ($('#giftTypeSelect').val() != "Pledge") {
                // assign designations (split gifts)
                $('.fund-card').not('.empty, .proc-fee:hidden').each(function() {
                    var gift = {
                        Amount: $(this).find('input').val(),
                        DesignationId: $(this).find('.fund-guid').text()
                    };

                    /*
                    var guidValue = $(this).find('.fund-guid').text();
                    if (guidValue == BBI.Defaults.generalFreeFormFund) {
                    	// if (
                    	//     $("#otherArea:visible").length !== 0 &&
                    	//     $("#otherArea:visible").val().length > 0
                    	// ) {
                    	var otherArea = {
                    		Value: $(this).find('.fund-name').text(),
                    	};
                    	donation.Gift.Comments = otherArea;
                    	// }

                    	// var str = "";

                    	// var instructions = $(this).find('.fund-name').text();
                    	// var amount = $(this).find('input').val();

                    	// str = "Other Fund: Amount: $" + amount + " | Fund Name: " + instructions;
                    	// // str = instructions;

                    	// donation.Gift.Comments = donation.Gift.Comments + str + " // ";
                    }
                    */

                    donation.Gift.Designations.push(gift);
                });
            }

            // assign donor title and custom attributes
            try {
                // donor title
                if ($('#personalTitle').val() !== '-1') {
                    donation.Donor.Title = $('#personalTitle option:selected').text();
                }

                // if solicitor code is in URL
                // if (!!BBI.Methods.returnQueryValueByName('solicitor')) {
                // var solicitorAttribute = {
                //     AttributeId: BBI.Defaults.solicitorCode,
                //     Value: BBI.Methods.returnQueryValueByName('solicitor')
                // };
                // donation.Gift.Attributes.push(solicitorAttribute);
                // }

                // matching gift
                if ($('#matchingGift').is(':checked')) {
                    var matchingGift = {
                        AttributeId: BBI.Defaults.matchingGift,
                        Value: 'True'
                    };
                    donation.Gift.Attributes.push(matchingGift);

                    // matching gift company name
                    if ($('#matchingGiftSearch').val() !== '') {
                        var matchingGiftCompanyName = {
                            AttributeId: BBI.Defaults.matchingGiftCompanyName,
                            Value: $('#matchingGiftName').val()
                        };
                        donation.Gift.Attributes.push(matchingGiftCompanyName);
                    }
                }

                // conditional for corporate
                if ($('#corporateGift').is(':checked')) {
                    donation.Gift.IsCorporate = true;
                    donation.Donor.OrganizationName = $("#companyName").val();
                }

            } catch (err) {
                console.log(err);
            }
            // comments
            if ($('#comments').val() !== '') {
                // var comments = {
                //     // AttributeId: BBI.Defaults.comments,
                //     Value: $('#comments').val()
                // };
                // donation.Gift.Comments.push(comments);
                donation.Gift.Comments = $.trim($("#comments").val());
            }

            // conditional for anonymous
            // if ($('#anonymousGift').is(':checked')) {
            //     donation.Gift.IsAnonymous = true;
            // }
            if ($("#anonymous:checked").length !== 0) {
                donation.Gift.IsAnonymous = true;
            }

            /*
            if ($("#wantOrnament:checked").length !== 0) {
                var wantOrnament = {
                    AttributeId: BBI.Defaults.customADFAttributes[
                        "Want Ornament?"
                    ],
                    Value: "Yes",
                };
                customAttributes.push(wantOrnament);
            } else {
                var wantOrnament = {
                    AttributeId: BBI.Defaults.customADFAttributes[
                        "Want Ornament?"
                    ],
                    Value: "No",
                };
                customAttributes.push(wantOrnament);
            } */

            // conditional for tribute
            // tribute (honoree) attributes
            if ($("input#honorOf:checked").length !== 0) {
                if ($("#tributeType:visible").length !== 0) {
                    var tributeType = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Tribute Gift Type"
                        ],
                        Value: $("#tributeType option:selected").val(),
                    };
                    customAttributes.push(tributeType);
                }
                if (
                    $("#tributeFirstName").length !== 0 &&
                    $("#tributeLastName").length !== 0
                ) {
                    var honoreeName = {
                        AttributeId: BBI.Defaults.customADFAttributes["Honoree Name"],
                        Value: $("#tributeFirstName").val() +
                            " " +
                            $("#tributeLastName").val(),
                    };
                    customAttributes.push(honoreeName);
                }
            }
            // acknowledgee attributes
            if ($("input#mailLetter:checked").length !== 0) {
                // if (
                //     $("#ackTitle").length !== 0 &&
                //     $("#ackTitle").val() !== "-1"
                // ) {
                //     var ackTitle = {
                //         AttributeId: BBI.Defaults.customADFAttributes[
                //             "Acknowledgee Title"
                //         ],
                //         Value: $("#ackTitle option:selected").text(),
                //     };
                //     customAttributes.push(ackTitle);
                // }
                if ($("#ackFirstName").length !== 0) {
                    var ackFirstName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee First Name"
                        ],
                        Value: $("#ackFirstName").val(),
                    };
                    customAttributes.push(ackFirstName);
                }
                if ($("#ackLastName").length !== 0) {
                    var ackLastName = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Last Name"
                        ],
                        Value: $("#ackLastName").val(),
                    };
                    customAttributes.push(ackLastName);
                }
                if ($("#ackAddress").length !== 0) {
                    var ackAddress = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Address"
                        ],
                        Value: $("#ackAddress").val(),
                    };
                    customAttributes.push(ackAddress);
                }
                if ($("#ackCity").length !== 0) {
                    var ackCity = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee City"
                        ],
                        Value: $("#ackCity").val(),
                    };
                    customAttributes.push(ackCity);
                }
                if ($("#ackState").length !== 0) {
                    var ackState = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee State"
                        ],
                        Value: $("#ackState option:selected").val(),
                    };
                    customAttributes.push(ackState);
                }
                if ($("#ackZipCode").length !== 0) {
                    var ackZip = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Zip"
                        ],
                        Value: $("#ackZipCode").val(),
                    };
                    customAttributes.push(ackZip);
                }
                if ($("#ackCountry").length !== 0) {
                    var ackCountry = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Country"
                        ],
                        Value: $("#ackCountry option:selected").text(),
                    };
                    customAttributes.push(ackCountry);
                }
                if (
                    $("#ackPhoneNumber").length !== 0 &&
                    $("#ackPhoneNumber").val() !== ""
                ) {
                    var ackPhone = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Phone"
                        ],
                        Value: $("#ackPhoneNumber").val(),
                    };
                    customAttributes.push(ackPhone);
                }
                if (
                    $("#ackEmail").length !== 0 &&
                    $("#ackEmail").val() !== ""
                ) {
                    var ackEmail = {
                        AttributeId: BBI.Defaults.customADFAttributes[
                            "Acknowledgee Email"
                        ],
                        Value: $("#ackEmail").val(),
                    };
                    customAttributes.push(ackEmail);
                }
            }
            this.donation.Gift.Attributes = customAttributes;

            // if ($('#honorOf').is(':checked') && !$('#mailLetter').is(':checked')) {
            //     donation.Gift.Tribute = {
            //         TributeDefinition: {
            //             Type: $("#tributeType").children("option:selected").val(),
            //             // $('#tributeType option:selected').val(),
            //             Description: 'New Tribute',
            //             FirstName: $('#tributeFirstName').val(),
            //             LastName: $('#tributeLastName').val()
            //         }
            //     };
            // }

            // conditional for tribute acknowledgement
            // if ($('#honorOf').is(':checked') && $('#mailLetter').is(':checked')) {
            //     donation.Gift.Tribute = {
            //         TributeDefinition: {
            //             Type: $("#tributeType option:selected").val(),
            //             // $('#tributeType input:checked').val(),
            //             Description: 'New Tribute',
            //             FirstName: $('#tributeFirstName').val(),
            //             LastName: $('#tributeLastName').val()
            //         },
            //         Acknowledgee: {
            //             FirstName: $('#ackFirstName').val(),
            //             LastName: $('#ackLastName').val(),
            //             AddressLines: $('#ackAddress').val(),
            //             City: $('#ackCity').val(),
            //             State: $('#ackState option:selected').val(),
            //             PostalCode: $('#ackZipCode').val(),
            //             Country: $.trim($('#ackCountry option:selected').text()),
            //             Phone: $('#ackPhoneNumber').val(),
            //             Email: $('#ackEmail').val()
            //         }
            //     };
            // }

            // conditional for recurring
            if ($('#giftTypeSelect').val() == "Monthly") {
                console.log("Monthly check");
                var startDate = $("#startDate").datepicker("getDate"), //Date.parse();
                    DayOfWeek = startDate.getDay(),
                    DayOfMonth = startDate.getDate(),
                    StartMonth = startDate.getMonth(),
                    frequency = $("#frequency").val();
                // var endDate = $("#endDate").val().length !== 0 ? $("#endDate").val() : null;
                if (frequency == 1) {
                    donation.Gift["Recurrence"] = {
                        DayOfWeek: DayOfWeek,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else if (frequency == 2) {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                } else {
                    donation.Gift["Recurrence"] = {
                        DayOfMonth: DayOfMonth,
                        Frequency: frequency,
                        StartDate: startDate,
                        // EndDate: endDate
                    };
                }
            }

            // conditional for pledge installments
            if ($('#giftTypeSelect').val() == "Pledge") {
                console.log("Pledge check");

                var pledge = {
                    AttributeId: BBI.Defaults.customADFAttributes["Pledge ID"],
                    Value: pledgeIdValue,
                };
                customAttributes.push(pledge);

                // donation.Gift.Attributes = [{
                //     AttributeId: BBI.Defaults.customADFAttributes["Pledge ID"],
                //     Value: pledgeAmountValue
                // }];

                donation.Gift.Designations = [{
                    Amount: pledgeAmountValue,
                    DesignationId: BBI.Defaults.pledgeFund,
                }];

                donation.Gift.Attributes = customAttributes;

            }

            // conditional for bill me later
            // if ($('#billMeLater').is(':checked')) {
            //     donation.Gift.PaymentMethod = 1;
            // }

            // set bbsp return url (credit card)
            if (donation.Gift.PaymentMethod === 0) {
                // donation.BBSPReturnUri = window.location.href;
            }

            // if finder number is in URL (core BBIS functionality)
            if (!!BBI.Methods.returnQueryValueByName('efndnum')) {
                donation.Gift.FinderNumber = BBI.Methods.returnQueryValueByName('efndnum');
            }

            // if source code is in URL (core BBIS functionality)
            if (!!BBI.Methods.returnQueryValueByName('source')) {
                donation.Gift.SourceCode = BBI.Methods.returnQueryValueByName('source');
            }

            // if appeal id exists
            if (!!BBI.Methods.returnQueryValueByName('appeal')) {
                donation.Origin.AppealId = BBI.Methods.returnQueryValueByName('appeal');
            }

            if ( window.location.pathname.toLowerCase().startsWith("/fye") ) {
                var origin = {
                    // AppealId: "07690458-068e-409d-90ea-ff2e605b6a11",
                    AppealId: "96eacba5-3a64-4c20-9461-63a743044717",
                    PageId: BLACKBAUD.api.pageInformation.pageId
                };
                donation.Origin = origin;
            }

            if ( window.location.pathname.toLowerCase().startsWith("/college-of-medicine") ) {
                var origin = {
                    AppealId: "47E0774C-8A1A-4A18-92AA-6EFBDBE7800F",
                    PageId: BLACKBAUD.api.pageInformation.pageId
                };
                donation.Origin = origin;
            }

            // if ($('#appeal').length !== 0 && !$('#appeal').is(':empty')) {
            //     donation.Gift.AppealId = $('#appeal').text();
            // }

            if ($("#wantOrnament:checked").length !== 0) {
                // Want Ornament?
                var wantOrnament = {
                    AttributeId: BBI.Defaults.wantOrnament,
                    Value: "Yes"
                };
                donation.Gift.Attributes.push(wantOrnament);
            } else {
                var wantOrnament = {
                    AttributeId: BBI.Defaults.wantOrnament,
                    Value: "No"
                };
                donation.Gift.Attributes.push(wantOrnament);
            }

            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                console.log(donation);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );
                // $("#adfSubmitButton")
                $("#adfSubmitButton")
                    .on("click", function(e) {
                        e.preventDefault();
                        // if (BBI.Methods.validateADF()) {
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        // BBI.Methods.gf2SubmitADF();
                        BBI.Methods.getDonationData();
                        // }
                    })
                    .removeClass("disabled");
            };

            console.log(donation);
            donationService.createDonation(
                donation,
                donationSuccess,
                donationFail
            );

            // return donation object
            return donation;
        },

        // Faculty Staff - getDonationData
        getDonationData1: function() {
            var anonymousGift = "";
            if ($("#anonymous:checked").length !== 0) {
                anonymousGift = true;
            } else {
                anonymousGift = false;
            }

            // create donation object
            var partId = $(".BBDonationApiContainer").attr("data-partid"),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false,
                }),
                giftAmount = $("#custom-amount").val(),
                designationID = $("#designationId").val(),
                customAttributes = [],
                designationArray = [];
            var donation = {
                Gift: {
                    Designations: [],
                    IsAnonymous: anonymousGift,
                    Attributes: [],
                    MerchantAccountId: BBI.Defaults.MerchantAccountId,
                    Comments: ""
                },
                Origin: {
                    AppealId: "",
                    PageId: BBI.Defaults.pageId,
                    PageName: 'Faculty/Staff Pledge'
                },
            };

            let billingtitle = $('#personalTitle option:selected').val().trim(),
                firstName = $('#personalFirstName').val(),
                lastName = $('#personalLastName').val(),
                address = $('#personalAddress').val(),
                addresstype = $('#personalAddressType option:selected').val(),
                country = $('#personalCountry option:selected').text().trim(),
                city = $('#personalCity').val(),
                state = $('#personalState option:selected').val(),
                zipcode = $('#personalZip').val(),
                phone = $('#personalPhone').val(),
                emailaddress = $('#personalEmail').val(),
                emailaddresstype = $('#personalEmailType option:selected').val();

            localStorage.setItem("billingtitle", billingtitle);
            localStorage.setItem("firstName", firstName);
            localStorage.setItem("lastName", lastName);
            localStorage.setItem("address", address);
            localStorage.setItem("addresstype", addresstype);
            localStorage.setItem("country", country);
            localStorage.setItem("city", city);
            localStorage.setItem("state", state);
            localStorage.setItem("zipcode", zipcode);
            localStorage.setItem("emailaddresstype", emailaddresstype);
            localStorage.setItem("phone", phone);
            localStorage.setItem("emailaddress", emailaddress);

            // assign designations (split gifts)
            $('.fund-card').not('.empty, .proc-fee:hidden').each(function() {
                var gift = {
                    Amount: $(this).find('input').val(),
                    DesignationId: $(this).find('.fund-guid').text()
                };
                donation.Gift.Designations.push(gift);
            });

            // AcknowledgeeTributeGiftType
            if ($('input[name="tributeType').is(':checked')) {
                var AcknowledgeeTributeGiftType = {
                    AttributeId: BBI.Defaults.AcknowledgeeTributeGiftType,
                    Value: $('input[name="tributeType"]:checked').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeTributeGiftType);

                // AcknowledgeeHonorName
                var AcknowledgeeHonorName = {
                    AttributeId: BBI.Defaults.AcknowledgeeHonorName,
                    Value: $('#tributeFirstName').val() + " " + $('#tributeLastName').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeHonorName);
            }

            // AcknowledgeeTitle
            // if ($('#AcknowledgeeTitle').val() !== '') {
            //     var AcknowledgeeTitle = {
            //         AttributeId: BBI.Defaults.AcknowledgeeFirstName,
            //         Value: $('#AcknowledgeeTitle').val()
            //     };
            //     donation.Gift.Attributes.push(AcknowledgeeFirstName);
            // }

            // AcknowledgeeFirstName
            if ($('#acknowledgeeFirstName').val() !== '') {
                var AcknowledgeeFirstName = {
                    AttributeId: BBI.Defaults.AcknowledgeeFirstName,
                    Value: $('#acknowledgeeFirstName').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeFirstName);
            }

            // AcknowledgeeLastName
            if ($('#acknowledgeeLastName').val() !== '') {
                var AcknowledgeeLastName = {
                    AttributeId: BBI.Defaults.AcknowledgeeLastName,
                    Value: $('#acknowledgeeLastName').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeLastName);
            }

            // AcknowledgeePhone
            if ($('#acknowledgeePhone').val() !== '') {
                var AcknowledgeePhone = {
                    AttributeId: BBI.Defaults.AcknowledgeePhone,
                    Value: $('#acknowledgeePhone').val()
                };
                donation.Gift.Attributes.push(AcknowledgeePhone);
            }

            // AcknowledgeeEmail
            if ($('#acknowledgeeEmail').val() !== '') {
                var AcknowledgeeEmail = {
                    AttributeId: BBI.Defaults.AcknowledgeeEmail,
                    Value: $('#acknowledgeeEmail').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeEmail);
            }

            // AcknowledgeeCity
            if ($('#acknowledgeeCity').val() !== '') {
                var AcknowledgeeCity = {
                    AttributeId: BBI.Defaults.AcknowledgeeCity,
                    Value: $('#acknowledgeeCity').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeCity);
            }

            // AcknowledgeeState
            if ($('#acknowledgeeState').val() !== '') {
                var AcknowledgeeState = {
                    AttributeId: BBI.Defaults.AcknowledgeeState,
                    Value: $('#acknowledgeeState').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeState);
            }

            // AcknowledgeeStreetAddress
            if ($('#acknowledgeeAddress').val() !== '') {
                var AcknowledgeeStreetAddress = {
                    AttributeId: BBI.Defaults.AcknowledgeeStreetAddress,
                    Value: $('#acknowledgeeAddress').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeStreetAddress);
            }

            // AcknowledgeeCountry
            if ($('#acknowledgeeCountry').val() !== '') {
                var AcknowledgeeCountry = {
                    AttributeId: BBI.Defaults.AcknowledgeeCountry,
                    Value: $('#acknowledgeeCountry option:selected').text()
                };
                donation.Gift.Attributes.push(AcknowledgeeCountry);
            }

            // AcknowledgeeZipCode
            if ($('#acknowledgeeZip').val() !== '') {
                var AcknowledgeeZipCode = {
                    AttributeId: BBI.Defaults.AcknowledgeeZipCode,
                    Value: $('#acknowledgeeZip').val()
                };
                donation.Gift.Attributes.push(AcknowledgeeZipCode);
            }

            // var solicitorAttribute = {
            // 	AttributeId: BBI.Defaults.solicitorCode,
            // 	Value: BBI.Methods.returnQueryValueByName('solicitor')
            // };
            // donation.Gift.Attributes.push(solicitorAttribute);

            // assign donor title and custom attributes
            try {
                // donor title
                if ($('#personalTitle').val() !== '-1') {
                    donation.Donor.Title = $('#personalTitle option:selected').text();
                }

                // if solicitor code is in URL
                // if (!!BBI.Methods.returnQueryValueByName('solicitor')) {
                // var solicitorAttribute = {
                //     AttributeId: BBI.Defaults.solicitorCode,
                //     Value: BBI.Methods.returnQueryValueByName('solicitor')
                // };
                // donation.Gift.Attributes.push(solicitorAttribute);
                // }

                // comments
                if ($('#comments').val() !== '') {
                    var comments = {
                        AttributeId: BBI.Defaults.comments,
                        Value: $('#comments').val()
                    };
                    donation.Gift.Attributes.push(comments);
                }

                // matching gift
                if ($('#matchingGift').is(':checked')) {
                    var matchingGift = {
                        AttributeId: BBI.Defaults.matchingGift,
                        Value: 'True'
                    };
                    donation.Gift.Attributes.push(matchingGift);

                    // matching gift company name
                    if ($('#matchingGiftSearch').val() !== '') {
                        var matchingGiftCompanyName = {
                            AttributeId: BBI.Defaults.matchingGiftCompanyName,
                            Value: $('#matchingGiftName').val()
                        };
                        donation.Gift.Attributes.push(matchingGiftCompanyName);
                    }
                }
            } catch (err) {
                console.log(err);
            }

            // conditional for anonymous
            // if ($("#anonymous:checked").length !== 0) {
            //     console.log("is anonymous!");
            //     donation.Gift.IsAnonymous = true;
            // }

            // conditional for do not start until existing/current pledge is completed
            // if ($('#startWhenCompleted').is(':checked')) {
            //     // donation.Gift.IsAnonymous = true;
            // }

            // conditional for corporate
            if ($('#corporateGift').is(':checked')) {
                donation.Gift.IsCorporate = true;
                donation.Donor.OrganizationName = $('#companyName').val();
            }

            // conditional for tribute
            if ($('#tributeGift').is(':checked') && !$('#ackLetter').is(':checked')) {
                donation.Gift.Tribute = {
                    TributeDefinition: {
                        Type: $('#tributeType label.active input').val(),
                        Description: 'New Tribute',
                        FirstName: $('#tributeFirstName').val(),
                        LastName: $('#tributeLastName').val()
                    }
                };
            }

            // conditional for tribute acknowledgement
            if ($('#tributeGift').is(':checked') && $('#ackLetter').is(':checked')) {
                donation.Gift.Tribute = {
                    TributeDefinition: {
                        Type: $('#tributeType label.active input').val(),
                        Description: 'New Tribute',
                        FirstName: $('#tributeFirstName').val(),
                        LastName: $('#tributeLastName').val()
                    },
                    Acknowledgee: {
                        FirstName: $('#acknowledgeeFirstName').val(),
                        LastName: $('#acknowledgeeLastName').val(),
                        AddressLines: $('#acknowledgeeAddress').val(),
                        City: $('#acknowledgeeCity').val(),
                        State: $('#acknowledgeeState').val(),
                        PostalCode: $('#acknowledgeeZip').val(),
                        Country: $('#acknowledgeeCountry option:selected').text().trim()
                    }
                };
            }

            // conditional for recurring
            if ($('#recurringGift').is(':checked')) {
                // field variables
                var frequency = $("#frequency").val(),
                    startDate = new Date($('#startDate').attr('data-date')),
                    endDate = new Date($('#endDate').val().replace(/-/g, '\/')),
                    dayOfMonth = startDate.getDate(),
                    month = startDate.getMonth() + 1;

                // monthly, quarterly, or annually
                if (frequency === '2') {
                    donation.Gift.Recurrence = {
                        DayOfMonth: dayOfMonth,
                        Frequency: 2,
                        StartDate: startDate,
                        EndDate: !!endDate ? endDate : '',
                        // ProcessNow: BBI.Methods.isProcessNow()
                    };
                } else if (frequency === '3') {
                    donation.Gift.Recurrence = {
                        DayOfMonth: dayOfMonth,
                        Frequency: 3,
                        StartDate: startDate,
                        EndDate: !!endDate ? endDate : '',
                        // ProcessNow: BBI.Methods.isProcessNow()
                    };
                } else if (frequency === '4') {
                    donation.Gift.Recurrence = {
                        DayOfMonth: dayOfMonth,
                        Month: month,
                        Frequency: 4,
                        StartDate: startDate,
                        EndDate: !!endDate ? endDate : '',
                        // ProcessNow: BBI.Methods.isProcessNow()
                    };
                }
            }

            // conditional for pledge installments
            if ($('#pledgeGift').is(':checked')) {
                donation.Origin.PageName = 'DPC Pledges';

                // field variables
                var frequency = $("#pledgeFrequency").val(),
                    // startDate = new Date($('#pledgeStartDate').attr('data-date')),
                    startDate = new Date($('#pledgeStartDate').val()),
                    // endDate = new Date($('#pledgeEndDate').val().replace(/-/g, '\/')),
                    endDate = '',
                    dayOfMonth = startDate.getDate(),
                    dayOfWeek = startDate.getDay(),
                    month = startDate.getMonth(); // + 1;

                // monthly, quarterly, or annually
                if (frequency === '1') {
                    // donation.Gift.Recurrence = {
                    //     DayOfMonth: dayOfMonth,
                    //     Frequency: 2,
                    //     StartDate: startDate,
                    //     EndDate: !!endDate ? endDate : '',
                    //     ProcessNow: BBI.Methods.isProcessNow()
                    // };
                } else if (frequency === '2') {
                    donation.Gift.Recurrence = {
                        DayOfMonth: dayOfMonth,
                        Frequency: 2,
                        StartDate: startDate,
                        EndDate: endDate,
                        // ProcessNow: BBI.Methods.isProcessNow()
                    };
                } else if (frequency === '3') {
                    donation.Gift.Recurrence = {
                        DayOfMonth: dayOfMonth,
                        Frequency: 3,
                        StartDate: startDate,
                        EndDate: endDate,
                        // ProcessNow: BBI.Methods.isProcessNow()
                    };
                } else if (frequency === '4') {
                    donation.Gift.Recurrence = {
                        DayOfMonth: dayOfMonth,
                        Month: month,
                        Frequency: 4,
                        StartDate: startDate,
                        EndDate: endDate,
                        // ProcessNow: BBI.Methods.isProcessNow()
                    };
                }

                // installment variables
                var numberOfInstallments = $('#pledgeInstallments').val(),
                    installmentAmount = $('.installment-amount').text().replace('$', '').replace(',', '');

                donation.Gift.PledgeInstallment = {
                    NumberOfInstallments: numberOfInstallments,
                    InstallmentAmount: installmentAmount
                };
            }

            var employerValue = {
                AttributeId: BBI.Defaults.employer,
                Value: $('#companyName option:selected').text().trim()
            };
            donation.Gift.Attributes.push(employerValue);

            // installment variables
            // var numberOfInstallments = $('#pledgeInstallments').val(),
            //     installmentAmount = $('#installmentAmount').val().replace('$', '').replace(',', '');
            //$('.installment-amount').text().replace('$', '').replace(',', '');

            // donation.Gift.PledgeInstallment = {
            //     NumberOfInstallments: numberOfInstallments,
            //     InstallmentAmount: installmentAmount
            // };

            // Do not start until existing/current pledge is completed.
            // if ($("input#startWhenCompleted").prop("checked") == true) {
            //     BBI.Defaults.doNotStartUntilExistingCompleted = "yes";
            // } else if ($("input#startWhenCompleted").prop("checked") == false) {
            //     BBI.Defaults.doNotStartUntilExistingCompleted = "no";
            // } else {}

            // Payroll Deduction Frequency (Monthly or Bi-Weekly)
            // BBI.Defaults.payrollDeductionFrequency = $("input[name='pay_period']:checked").val();

            var payrollDeductionFrequency = {
                AttributeId: BBI.Defaults.payrollDeductionFrequency,
                Value: $("input[name='pay_period']:checked").val()
            };
            donation.Gift.Attributes.push(payrollDeductionFrequency);


            if ($("#wantOrnament:checked").length !== 0) {
                // Want Ornament?
                var wantOrnament = {
                    AttributeId: BBI.Defaults.wantOrnament,
                    Value: "Yes"
                };
                donation.Gift.Attributes.push(wantOrnament);
            } else {
                var wantOrnament = {
                    AttributeId: BBI.Defaults.wantOrnament,
                    Value: "no"
                };
                donation.Gift.Attributes.push(wantOrnament);
            }

            if ($("#givingTuesdayAmbassador").val() != "") {
                var givingTuesdayAmbassador = {
                    AttributeId: BBI.Defaults.givingTuesdayAmbassador,
                    Value: $("#givingTuesdayAmbassador").val()
                };
                donation.Gift.Attributes.push(givingTuesdayAmbassador);
            }

            // Check if gift is Anonymous
            // var isAnonymous = {
            //     AttributeId: BBI.Defaults.anonymousGift,
            //     Value: "Yes"
            // };
            // donation.Gift.Attributes.push(isAnonymous);

            if ($("#anonymous:checked").length !== 0) {
                // Anonymous Gift?
                var anonymousGiftSelected = {
                    AttributeId: BBI.Defaults.anonymousGift,
                    Value: "Yes"
                };
                donation.Gift.Attributes.push(anonymousGiftSelected);
            } else {
                var anonymousGiftSelected = {
                    AttributeId: BBI.Defaults.anonymousGift,
                    Value: "No"
                };
                donation.Gift.Attributes.push(anonymousGiftSelected);
            }

            // if ($("#anonymous:checked").length !== 0) {
            //     // Want Ornament?
            //     var isAnonymous = {
            //         AttributeId: BBI.Defaults.anonymousGift,
            //         Value: "Yes"
            //     };
            //     donation.Gift.Attributes.push(isAnonymous);
            // } else {
            //     var isAnonymous = {
            //         AttributeId: BBI.Defaults.anonymousGift,
            //         Value: "no"
            //     };
            //     donation.Gift.Attributes.push(isAnonymous);
            // }

            // if ($("#anonymous:checked").length !== 0) {
            //     // var isAnonymousGift = {
            //     //     AttributeId: BBI.Defaults.anonymousGift,
            //     //     Value: "Yes"
            //     // };
            //     donation.Gift.IsAnonymous = true;
            //     // donation.Gift.Attributes.push(isAnonymousGift);
            // } 

            // if ($("#anonymous").is(':checked')) {
            //     var anonymous = {
            //         'AttributeId': BBI.Defaults.anonymousGift,
            //         'Value': true
            //     };
            //     donation.Gift.Attributes.push(anonymous);
            // }

            // if ($("#anonymous:checked").length !== 0) {
            //     var giveAnonymously = {
            //         AttributeId: BBI.Defaults.anonymousGift,
            //         Value: true
            //     };
            //     donation.Gift.Attributes.push(giveAnonymously);
            // }

            // Payroll Deduction M Number
            // BBI.Defaults.payrollDeductionMNumber = $("#employeeID").val();

            var payrollDeductionMNumber = {
                AttributeId: BBI.Defaults.payrollDeductionMNumber,
                Value: $("#employeeID").val()
            };
            donation.Gift.Attributes.push(payrollDeductionMNumber);

            // Payroll Deduction starts after current pledge
            if ($('input#startWhenCompleted').prop('checked')) {
                var pdStartAfterCurrentPledge = {
                    AttributeId: BBI.Defaults.pdStartAfterCurrentPledge,
                    Value: "Y"
                };
                donation.Gift.Attributes.push(pdStartAfterCurrentPledge);
            }

            // Faculty & Staff Payroll Deduction Pledges 
            donation.Origin.PageName = 'Faculty & Staff Payroll Deduction Pledges';

            // field variables
            var frequency = $("#pledgeFrequency").val(),
                // startDate = new Date($('#pledgeStartDate').attr('data-date')),
                startDate = new Date($('#pledgeStartDate').val()),
                // endDate = new Date($('#pledgeEndDate').val().replace(/-/g, '\/')),
                endDate = '',
                dayOfMonth = startDate.getDate(),
                dayOfWeek = startDate.getDay(),
                month = startDate.getMonth(); // + 1;

            // monthly, quarterly, or annually
            if (frequency === '1') {
                // donation.Gift.Recurrence = {
                //     DayOfMonth: dayOfMonth,
                //     Frequency: 2,
                //     StartDate: startDate,
                //     EndDate: !!endDate ? endDate : '',
                //     ProcessNow: BBI.Methods.isProcessNow()
                // };
            } else if (frequency === '2') {
                donation.Gift.Recurrence = {
                    DayOfMonth: dayOfMonth,
                    Frequency: 2,
                    StartDate: startDate,
                    EndDate: endDate,
                    // ProcessNow: BBI.Methods.isProcessNow()
                };
            } else if (frequency === '3') {
                donation.Gift.Recurrence = {
                    DayOfMonth: dayOfMonth,
                    Frequency: 3,
                    StartDate: startDate,
                    EndDate: endDate,
                    // ProcessNow: BBI.Methods.isProcessNow()
                };
            } else if (frequency === '4') {
                donation.Gift.Recurrence = {
                    DayOfMonth: dayOfMonth,
                    Month: month,
                    Frequency: 4,
                    StartDate: startDate,
                    EndDate: endDate,
                    // ProcessNow: BBI.Methods.isProcessNow()
                };
            } else {
                // do nothing
            }

            // M#/UCID
            var employeeID = $("#employeeID").val();
            donation.Gift.Comments = "M#/UCID: " + employeeID;

            // installment variables
            // var numberOfInstallments = parseInt($('#numberOfInstallments').val()),
            //     installmentAmount = $('#installmentAmount').val().replace('$', '').replace(',', '');

            // donation.Gift.PledgeInstallment = {
            //     NumberOfInstallments: numberOfInstallments,
            //     InstallmentAmount: installmentAmount
            // };

            var numberOfInstallments = parseInt($('#numberOfInstallments').val());
            if (numberOfInstallments) {
                var giftAmount = $("#totalGift").val().replace("$", "").replace(",", "");

                //Amount has been hardcoded to 500. Replace the value with a value entered by user.
                var installmentAmount = donationService.getRecurringGiftInstallmentAmount(giftAmount, numberOfInstallments);

                donation.Gift.PledgeInstallment = {
                    NumberOfInstallments: numberOfInstallments,
                    InstallmentAmount: installmentAmount
                }
            }

            // Get frequency value
            var frequencyValue = $("#frequency").find("input[name='pay_period']:checked").val();
            console.log(frequencyValue);

            if (frequencyValue) {
                // The following fields are always required
                // donation.Gift.Recurrence = {
                // 	Frequency: $("#frequency").find("input[name='pay_period']:checked").val(),
                // 	StartDate: $('#startMonth').val(),
                // 	DayOfMonth: 1
                // };

                function dateNow(splinter) {
                    var set = new Date($('#startMonth').val());
                    var getDate = set.getDate().toString();
                    // if (getDate.length == 1) { //example if 1 change to 01
                    //     getDate = "0" + getDate;
                    // }
                    var getMonth = (set.getMonth() + 1).toString();
                    if (getMonth.length == 1) {
                        getMonth = "0" + getMonth;
                    }
                    var getYear = set.getFullYear().toString();
                    var dateNow = getMonth + splinter + getDate + splinter + getYear; //today
                    return dateNow;
                }

                // field variables
                var frequency = $("#frequency").find("input[name='pay_period']:checked").val(),
                    // startDate = new Date($('#pledgeStartDate').attr('data-date')),
                    startDate = new Date($('#startMonth').val()),
                    // endDate = new Date($('#pledgeEndDate').val().replace(/-/g, '\/')),
                    endDate = '',
                    dayOfMonth = startDate.getDate(),
                    dayOfWeek = startDate.getDay(),
                    month = startDate.getMonth() + 1,
                    year = startDate.getYear();

                var lastday = function(y, m) {
                    return new Date(y, m, 0).getDate();
                }

                var lastDayOfMonth = lastday(year, month);
                // year = year.split(" ")[1]
                console.log(dateNow("/"));

                /* monthly, quarterly, or annually */
                if (frequency) {
                    donation.Gift.Recurrence = {
                        DayOfMonth: 1, // lastDayOfMonth,
                        Frequency: 2,
                        StartDate: startDate,
                        EndDate: endDate,
                    };
                }

                var payrollDeductionStartDate = {
                    AttributeId: BBI.Defaults.payrollDeductionStartDate,
                    Value: dateNow("/")
                };
                donation.Gift.Attributes.push(payrollDeductionStartDate);

            }

            // donation.Gift.PledgeInstallment = {
            // 	NumberOfInstallments: numberOfInstallments,
            // 	InstallmentAmount: installmentAmount
            // };

            // conditional for bill me later
            // if ($('#billMeLater').is(':checked')) {
            //     donation.Gift.PaymentMethod = 1;
            // }

            // set bbsp return url (credit card)
            if (donation.Gift.PaymentMethod === 0) {
                // donation.BBSPReturnUri = window.location.href;
            }

            // if finder number is in URL (core BBIS functionality)
            if (!!BBI.Methods.returnQueryValueByName('efndnum')) {
                donation.Gift.FinderNumber = BBI.Methods.returnQueryValueByName('efndnum');
            }

            // if source code is in URL (core BBIS functionality)
            if (!!BBI.Methods.returnQueryValueByName('source')) {
                donation.Gift.SourceCode = BBI.Methods.returnQueryValueByName('source');
            }

            // if appeal id exists
            // if ($('#appeal').length !== 0 && !$('#appeal').is(':empty')) {
            //     donation.Gift.AppealId = $('#appeal').text();
            // }

            donation.Origin.AppealId = $("#companyName").val();

            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                // console.log(donation);
            };
            donationFail = function(d) {
                $(".BBFormValidatorSummary").html(
                    "<p>" + BBI.Methods.convertErrorsToHtml(d) + "</p>"
                );

                $("#adfSubmit")
                    .on("click", function(e) {
                        e.preventDefault();
                        // if (BBI.Methods.validateADF()) {
                        $(this)
                            .addClass("disabled")
                            .unbind("click");
                        // BBI.Methods.gf2SubmitADF();
                        BBI.Methods.getDonationData1();
                        // }
                    })
                    .removeClass("disabled");
            };

            console.log(donation);

            donationService.createDonation(
                donation,
                donationSuccess,
                donationFail
            );

            // return donation object
            return donation;
        },

        // check equality of server date and (recurring or pledge installment gift) start date
        isProcessNow: function() {
            var frequency,
                startDate;

            if ($('#recurringGift').is(':checked')) {
                frequency = $("#frequency").val();
                startDate = new Date($('#startDate').attr('data-date'));
            } else if ($('#pledgeGift').is(':checked')) {
                frequency = $("#pledgeFrequency").val();
                startDate = new Date($('#pledgeStartDate').attr('data-date'));
            }

            var dayOfMonth = startDate.getDate(),
                month = startDate.getMonth() + 1,
                serverDate = BBI.Defaults.serverDate,
                recurrenceStartDate = startDate,
                startDateIsTodayDate = false,
                isProcessedNow = false;

            if (recurrenceStartDate.getFullYear() === serverDate.getFullYear() && recurrenceStartDate.getMonth() === serverDate.getMonth() && recurrenceStartDate.getDate() === serverDate.getDate()) {
                startDateIsTodayDate = true;
            } else {
                return false;
            }

            if (frequency === '2' || frequency === '3') {
                isProcessedNow = startDateIsTodayDate && dayOfMonth === serverDate.getDate();
            } else if (frequency === '4') {
                isProcessedNow = startDateIsTodayDate && dayOfMonth === serverDate.getDate() && month === serverDate.getMonth() + 1;
            } else {
                isProcessedNow = false;
            }

            return isProcessedNow;
        },

        renderFunds: function() {
            // variables for source code, finder number, category, subcategory, designation, amount, search, and funderTransactionId from URL
            var sourceCode;
            var finderNumber;
            var cat;
            var subcat;
            var des;
            var urlAmount;
            var urlSearch;
            var recurring;
            var hideack;
            var funderTransactionId;
            var urlDesignationGuid;

            var myGift = {};

            // Variables for the attribute GUIDs (add, subtract, rename as necessary)
            var otherDesignationGuid = "7f924538-ac30-4fa0-96c6-e243a2fddb12"; // generic attribute - use for "can't find your fund" functionality
            //var giftTypeGuid = "406f92fb-0dea-43df-88e6-3f7c0f7d6dcb"; // Online Gift Type // commented
            //var donorTypeGuid = "f5c0424e-f97e-438b-a7e5-8201634bb98f"; // Online Gift Donor Type // commented
            var businessNameGuid = "562152e0-b70b-4080-9270-0e9cdc7a8b1e"; // Online Donation - Organization Name // commented
            var repNameGuid = "9f7369d0-a6ca-4faf-bf04-b2e8cc992f1a"; // Online Donation - Organization Representative Name
            var repTitleGuid = "e533e43d-e96c-4277-929f-449d178b3b8c"; // Online Donation - Organization Title
            var funderTransactionGuid = "9AD6ADE3-6342-4DC7-AE21-2EDBA8984530";

            // global array for designations
            var designationArray = [];

            /* GiftSession moved */

            function setCategories(e, subcat) {
                // SCHOOL OR COLLEGE selected
                // Arrays of tags to use for filtering designations.  FIRST VALUE IS FOR FILTERING - SECOND VALUE IS DISPLAYED TEXT.
                // Third value is for default designation.  If included, use this fund as the default choice.
                var schoolList = [
                    ["99 - Others", "University-wide", "bec20fdc-0e79-42ae-b353-b5b46c02f73e"],
                    ["29 - Athletics and UCATS", "Athletics and UCATS"],
                    ["25 - College of Allied Health Sciences", "College of Allied Health Sciences"],
                    ["01 - College of Arts & Sciences", "College of Arts &amp; Sciences"],
                    ["19 - College of Cooperative Education and Professional Studies", "College of Cooperative Education and Professional Studies"],
                    ["04 - College of Design, Architecture, Art & Planning", "College of Design, Architecture, Art &amp; Planning"],
                    ["09 - College of Education, Criminal Justice, and Human Services", "College of Education, Criminal Justice, and Human Services"],
                    ["05 - College of Engineering & Applied Science", "College of Engineering &amp; Applied Science"],
                    ["06 - College of Law", "College of Law"],
                    ["16 - College of Medicine", "College of Medicine"],
                    ["17 - College of Nursing", "College of Nursing"],
                    ["03 - College-Conservatory of Music", "College-Conservatory of Music"],
                    ["43 - Heart, Lung and Vascular Institute", "Heart, Lung and Vascular Institute"],
                    ["23 - Hoxworth", "Hoxworth"],
                    ["33 - Institute for Policy Research", "Institute for Policy Research"],
                    ["34 - Lindner Center of HOPE", "Lindner Center of HOPE"], 
                    ["02 - Lindner College of Business", "Lindner College of Business"],
                    ["14 - Student Affairs/Provost", "Student Affairs/Provost"],
                    ["28 - UC Alumni Association", "UC Alumni Association"],
                    ["12 - UC Blue Ash College", "UC Blue Ash College"],
                    ["42 - UC Cancer Center", "UC Cancer Center"],
                    ["07 - UC Clermont College", "UC Clermont College"],
                    ["30 - UC Foundation", "UC Foundation"],
                    ["41 - UC Gardner Neuroscience Institute", "UC Gardner Neuroscience Institute"],
                    ["20 - UC Health", "UC Health"],
                    ["26 - UC Libraries", "UC Libraries"],
                    ["18 - Winkle College of Pharmacy", "Winkle College of Pharmacy"],
                    ["27 - General Funds - Unrestricted", "General Funds - Unrestricted"],
                    ["32 - Campus Open Space", "Campus Open Space"]
                ];
                var campusList = [
                    // OTHER AREA selected                    
                    ["99 - Others", "University-wide", "bec20fdc-0e79-42ae-b353-b5b46c02f73e"],
                    ["The UC Fund", "The UC Fund"],
                    ["Scholarships", "Scholarships"],
                    ["UC Health", "UC Health"],
                    ["29 - Athletics and UCATS", "Athletics and UCATS"],
                    ["25 - College of Allied Health Sciences", "College of Allied Health Sciences"],
                    ["01 - College of Arts & Sciences", "College of Arts &amp; Sciences"],
                    ["04 - College of Design, Architecture, Art & Planning", "College of Design, Architecture, Art &amp; Planning"],
                    ["09 - College of Education, Criminal Justice, and Human Services", "College of Education, Criminal Justice, and Human Services"],
                    ["05 - College of Engineering & Applied Science", "College of Engineering &amp; Applied Science"],
                    ["06 - College of Law", "College of Law"],
                    ["16 - College of Medicine", "College of Medicine"],
                    ["17 - College of Nursing", "College of Nursing"],
                    ["03 - College-Conservatory of Music", "College-Conservatory of Music"],
                    ["43 - Heart, Lung and Vascular Institute", "Heart, Lung and Vascular Institute"],
                    ["23 - Hoxworth", "Hoxworth"],
                    ["33 - Institute for Policy Research", "Institute for Policy Research"],
                    ["02 - Lindner College of Business", "Lindner College of Business"],
                    ["14 - Student Affairs/Provost", "Student Affairs/Provost"],
                    ["28 - UC Alumni Association", "UC Alumni Association"],
                    ["12 - UC Blue Ash College", "UC Blue Ash College"],
                    ["42 - UC Cancer Center", "UC Cancer Center"],
                    ["07 - UC Clermont College", "UC Clermont College"],
                    ["30 - UC Foundation", "UC Foundation"],
                    ["41 - UC Gardner Neuroscience Institute", "UC Gardner Neuroscience Institute"],
                    ["20 - UC Health", "UC Health"],
                    ["26 - UC Libraries", "UC Libraries"],
                    ["18 - Winkle College of Pharmacy", "Winkle College of Pharmacy"]
                ];
                var causeList = [
                    ["The UC Fund", "The UC Fund", ""],
                    ["Scholarships", "Scholarships", ""],
                    ["UC Health", "UC Health", ""]
                ];

                if (e == "default") {
                    var category = "school";
                } else {
                    if (typeof e == "object") {
                        // event object passed from selector click
                        var category = e.target.id;
                    } else {
                        // category string passed, taken from URL parameter
                        var category = e;
                    }
                }
                if (category.toLowerCase() == "otherarea") category = "campus";
                switch (category) {
                    case "school":
                        selectList = schoolList;
                        break;
                    case "campus":
                        selectList = campusList;
                        break;
                    case "cause":
                        selectList = causeList;
                        break;
                    default:
                        selectList = schoolList;
                        break;
                }
                var categorySelector = document.getElementById("categoryList");
                categorySelector.innerHTML = "";
                if (category == "cause")
                    $("#categoryList").append(
                        '<option value selected="selected">Make a selection</option>'
                    );
                for (var i = 0; i < selectList.length; i++) {
                    var opt = document.createElement("option");
                    opt.value = selectList[i][0].toLowerCase().replace(/[\'\"]/g, "");
                    opt.innerHTML = selectList[i][1];
                    opt.setAttribute("data-default", selectList[i][2]);
                    categorySelector.appendChild(opt);
                }

                // If 'subcat' is passed, mark that category as selected
                if (subcat) {
                    $(
                        "#categoryList option[value='" +
                        subcat.toLowerCase().replace(/[\'\"]/g, "") +
                        "']"
                    ).attr("selected", "selected");
                }
            }

            function filterDesignations(txt, type, def) {
                console.log("filterDesignations1");
                // load designations based on category chosen
                var desArray = [];
                desArray = designationArray;
                // console.log(desArray);
                var desId = document.getElementById("designationId");
                desId.options.length = 1;
                // desId.innerHTML = "";

                // Counter for number of designations found
                var desCount = 0;

                for (var i = 0; i < desArray.length; i++) {
                    for (var j = 0; j < desArray[i].length; j++) {
                        if (type == "tag") {
                            // Look for exact string match.
                            var compTxt = txt.toLowerCase().replace(/[\'\"]/g, "");
                            comp = compTxt == desArray[i][j].toLowerCase().replace(/[\'\"]/g, "");

                            // console.log("desArray[i][j]: " + desArray[i][j]);
                            // Accommodate the tag name change from "Honors Program" to "Honors".  If it's either one, it can match either one.
                            
                        } else {
                            comp = desArray[i][j].toLowerCase().search(txt.toLowerCase()) >= 0;
                        }
                        if (comp) {
                            var opt = document.createElement("option");
                            // opt.value = desArray[i][1];
                            opt.value = desArray[i][6]; // GUID of Designation
                            // opt.innerHTML = desArray[i][0] + " - " + desArray[i][2];
                            // opt.innerHTML = desArray[i][1] + " - " + desArray[i][3]; // Fund Name + Lookup ID
                            opt.innerHTML = desArray[i][0]
                            opt.setAttribute("data-description", desArray[i][4]); // Designation Description // desArray[i][3]
                            desId.appendChild(opt);
                            desCount++; // add to designation count
                            break;
                        }
                    }
                }

                // var causeSelected = $("#cause").hasClass("selected") == true;

                // append "can't find your fund" option
                var otherOpt = document.createElement("option");
                // otherOpt.value = "bec20fdc-0e79-42ae-b353-b5b46c02f73e";
                otherOpt.value = "default";
                otherOpt.innerHTML = "🔍︎ Can't find your fund?";
                // if (causeSelected) {
                //     otherOpt.setAttribute(
                //         "data-description",
                //         'Please enter a brief description of the area you would like to support below. \nHelp us improve our list by suggesting a "cause" area for your fund selection.'
                //     );
                // } else {
                //     otherOpt.setAttribute(
                //         "data-description",
                //         "Please enter a brief description of the area you would like to support below."
                //     );
                // }

                // otherOpt.setAttribute("data-other", true);
                // desId.appendChild(otherOpt);

                if (desCount == 1) {
                    $("#designationCount").text(" (" + desCount + " result found)");
                    $("#designationId option").first().attr("selected", "selected");

                    //$("#designationId").val($("#designationId option:first").val());
                    $("#designationId").val($("#designationId option").first().val());
                } else {
                    $("#designationCount").text(" (" + desCount + " results found)");
                }
                $("#designationCount").show();

                if (def && def.length > 10) {
                    // $("#designationId").val(def.toLowerCase());
                } else {
                    // var desId = $("#designationId option:contains('" + def + "')").val();
                    // if (desId) $("#designationId").val(desId.toLowerCase());
                }

                $("div[id*='designationId']").effect("highlight", {}, 700);
                // setDescription();
            }


            // See about putting everything in here instead of initializing the Query API in the form setup.
            // Maybe pass the Query ID instead of hard-coding it inside the function.
            //blockForm($(".donationForm"));

            var queryInstanceId = "b0e28c08-4081-4328-91f5-8509243f5d79";
            // Staging "4146d3c8-c678-4b1a-9a23-1c163c05b39f"; 
            // Production "b0e28c08-4081-4328-91f5-8509243f5d79"
            //"aa7bb498-5129-4ec5-ac1b-9fd9e560449d"; // BBIS - Find a Fund Designations - Abridged
            var queryOptions = {
                crossDomain: false
            };
            var filters = [];
            var queryService = new BLACKBAUD.api.QueryService(queryOptions);

            querySuccess = function(obj) {
                designationArray = [];
                for (var i = 0; i < obj.Rows.length; i++) {
                    var tempArray = [
                        obj.Rows[i].Values[0],
                        obj.Rows[i].Values[1],
                        obj.Rows[i].Values[2],
                        obj.Rows[i].Values[3],
                        obj.Rows[i].Values[4],

                        obj.Rows[i].Values[5],
                        obj.Rows[i].Values[6],
                        obj.Rows[i].Values[7],
                        obj.Rows[i].Values[8],
                        obj.Rows[i].Values[9]
                    ];

                    if (i > 1 && obj.Rows[i].Values[0] == obj.Rows[i - 1].Values[0]) {
                        designationArray[designationArray.length - 1].push(obj.Rows[i].Values[4]);
                    } else {
                        designationArray.push(tempArray);
                    }
                }

                // sort array results and remove duplicates
                var sortedArray = designationArray.sort(compare);
                var tidiedArray = [];

                /* alternate designation process:
                - create second array (tidiedArray)
                - loop through first array and
                -- push funds that aren't already in the array
                -- if they are already in the array, push the tag */
                for (var i = 0; i < sortedArray.length; i++) {
                    if (tidiedArray.indexOf(sortedArray[i]) < 0) {
                        tidiedArray.push(sortedArray[i]);
                    }
                }

                for (var i = 0; i < sortedArray.length - 1; i++) {
                    // need a way to check more than just the next, or previous, fund
                    // for each fund, loop through the upcoming funds until the name does NOT match the current name - grab and push the tags and delete the funds

                    if (sortedArray[i][0] == sortedArray[i + 1][0]) {
                        sortedArray[i + 1].push(sortedArray[i][3]);
                        sortedArray.splice(i, 1);
                    }
                }
                designationArray = sortedArray;
                console.log("querySuccess");
                console.log(designationArray);

                // Generate option elements for designation selectors, based on designationArray
                for (var i = 0; i < designationArray.length; i++) {
                    var otherDes = document.getElementById("designationId");
                    var otherOpt = document.createElement("option");
                    otherOpt.value = designationArray[i][1];
                    otherOpt.innerHTML =
                        designationArray[i][0] + " - " + designationArray[i][2];
                    otherOpt.setAttribute("data-description", designationArray[i][4]);
                    otherDes.appendChild(otherOpt);
                }
                if (subcat) {
                    // *** add des filter.  It should fail gracefully, if fund isn't found...
                    // updateCategories(cat, subcat);
                    setCategories(cat, subcat);
                    // console.log("setCategories J location");
                    if (des) {
                        filterDesignations(subcat, "tag", des);
                    } else {
                        var def = $(
                            "#categoryList option[value='" +
                            subcat.toLowerCase().replace(/[\'\"]/g, "") +
                            "']"
                        ).attr("data-default");
                        filterDesignations(subcat, "tag", def);
                    }
                } else if (des) {
                    setCategories("default");
                    // console.log("setCategories K location");
                    filterDesignations(des, "search", des);
                } else if (urlSearch) {
                    setCategories("default");
                    // console.log("setCategories L location");
                    filterDesignations(urlSearch, "search");
                } else if (cat) {
                    // This should be run if a category is sent, but no subcategory.  Should work for all four categories.
                    // updateCategories(cat);
                    setCategories(cat);
                    // console.log("setCategories M location");
                } else {
                    setCategories("default");
                    // console.log("setCategories N location");
                    filterDesignations(
                        //"Unrestricted",
                        "999 - Others", // Unit Attribute\Value column
                        "tag",
                        "default"
                        // "bec20fdc-0e79-42ae-b353-b5b46c02f73e" // System record ID
                        //"d68341c5-71e8-4362-b8ab-1ecb3b192432"
                    );
                }
                unblockForm($(".donationForm"));
            };
            queryFailure = function(obj) {
                unblockForm($(".donationForm"));
            };
            var queryResults = queryService.getResults(
                queryInstanceId,
                querySuccess,
                queryFailure,
                filters
            );
        },

        populateCountryDropdowns: function() {
            var selectCountry = $("#personalCountry");
            var selectState = $("#personalState");
            if ($('#donationForm').length !== 0 || $('#dayofgiving').length !== 0) {
                var selectAckCountry = $("#ackCountry");
                var selectAckState = $("#ackState");
            }
            var service = new BLACKBAUD.api.CountryService();

            // Load Countries
            service.getCountries(function(countries) {
                for (var i = 0, j = countries.length; i < j; i++) {
                    selectCountry.append('<option value="' + countries[i].Id + '">' + countries[i].Description + '</option>');
                }
            });

            // Watch Countries Change
            $("#personalCountry").on("change", function() {
                // Load States
                service.getStates($(this).val(), function(states) {
                    // selectState.html("");
                    $("#personalState option:gt(0)").remove();
                    for (var i = 0, j = states.length; i < j; i++) {
                        // console.log(states[i]);
                        selectState.append('<option value="' + states[i].Abbreviation + '">' + states[i].Description + '</option>');
                    }
                });
            });

            if ($('#donationForm').length !== 0 || $('#dayofgiving').length !== 0) {
                // Load Countries
                service.getCountries(function(countries) {
                    for (var i = 0, j = countries.length; i < j; i++) {
                        selectAckCountry.append('<option value="' + countries[i].Id + '">' + countries[i].Description + '</option>');
                    }
                });

                // Watch Countries Change
                $("#ackCountry").on("change", function() {
                    // Load States
                    service.getStates($(this).val(), function(states) {
                        // selectAckState.html("");
                        $("#ackState option:gt(0)").remove();
                        for (var i = 0, j = states.length; i < j; i++) {
                            // console.log(states[i]);
                            selectAckState.append('<option value="' + states[i].Abbreviation + '">' + states[i].Description + '</option>');
                        }
                    });
                });
            }

            // BBI.Methods.populateStateDropdowns($("#personalCountry").find('[value="USA"]').attr("id"));

            // var countryService = new BLACKBAUD.api.CountryService({
            //     url: BBI.Defaults.rootpath,
            //     crossDomain: false
            // });
            // countryService.getCountries(function(country) {
            //     $.each(country, function() {
            //         $("#ackCountry")
            //             .append($("<option></option>")
            //                 .val(this["Abbreviation"])
            //                 .text(this["Description"])
            //                 .attr("id", this["Id"]));
            //     });
            //     BBI.Methods.populateStateDropdowns($("#ackCountry").find("[value='USA']").attr("id"));
            //     $("#ackCountry").val("USA").on("change", function() {
            //         var countryID = $(this).find(":selected").attr("id");
            //         BBI.Methods.populateStateDropdowns(countryID);
            //     });
            // });
            // countryService.getCountries(function(country) {
            //     $.each(country, function() {
            //         $("#acknowledgeeCountry").append(
            //             $("<option></option>")
            //             .val(this["Abbreviation"])
            //             .text(this["Description"])
            //             .attr("id", this["Id"])
            //         );
            //     });
            //     BBI.Methods.populateStateDropdowns(
            //         $("#acknowledgeeCountry")
            //         .find('[value="USA"]')
            //         .attr("id")
            //     );
            //     $("#acknowledgeeCountry")
            //         .val("USA")
            //         .on("change", function() {
            //             var countryID = $(this)
            //                 .find(":selected")
            //                 .attr("id");
            //             BBI.Methods.populateStateDropdowns(countryID);
            //         });
            // });
        },

        populateStateDropdowns: function(countryID) {
            // var countryService = new BLACKBAUD.api.CountryService({
            //     url: BBI.Defaults.rootpath,
            //     crossDomain: false
            // });
            // countryService.getStates(countryID, function(state) {
            //     $("#ackState option:gt(0)").remove();
            //     $.each(state, function() {
            //         $("#ackState").append($("<option></option>").val(this["Abbreviation"]).text(this["Description"]));
            //     });
            // });
            // countryService.getStates(countryID, function(state) {
            //     $("#acknowledgeeState option:gt(0)").remove();
            //     $.each(state, function() {
            //         $("#acknowledgeeState").append(
            //             $("<option></option>")
            //             .val(this["Abbreviation"])
            //             .text(this["Description"])
            //         );
            //     });
            // });
        },

        getCountryState: function() {
            var selectDonorCountry = $('#personalCountry'),
                selectDonorState = $('#personalState'),
                selectAckCountry = $('#acknowledgeeCountry'),
                selectAckState = $('#acknowledgeeState');

            // load countries
            // $.get(BBI.Defaults.rootPath + 'webapi/country', function(countries) {
            //     for (var i = 0, j = countries.length; i < j; i++) {
            //         selectDonorCountry.append('<option value="' + countries[i].Id + '">' + countries[i].Description + '</option>');
            //         selectAckCountry.append('<option value="' + countries[i].Id + '">' + countries[i].Description + '</option>');
            //     }
            // }).done(function() {
            //     // default country (United States)
            //     selectDonorCountry.val(BBI.Defaults.defaultCountry).change();
            //     selectAckCountry.val(BBI.Defaults.defaultCountry).change();
            // });

            // watch country change (donor)
            // selectDonorCountry.on('change', function() {
            // load states
            // $.get(BBI.Defaults.rootPath + 'webapi/country/' + $(this).val() + '/state', function (states)
            $.get(BBI.Defaults.rootPath + 'webapi/country/' + BBI.Defaults.defaultCountry + '/state', function(states) {

                selectDonorState.html('');
                for (var i = 0, j = states.length; i < j; i++) {
                    selectDonorState.append('<option value="' + states[i].Abbreviation + '">' + states[i].Description + '</option>');
                }
                selectDonorState.prepend('<option value="-1">State/Territory</option>').val('-1');
            }).done(function() {
                if (selectDonorState.find('option').length < 2) {
                    selectDonorState.removeAttr('required').removeClass('required');
                    selectDonorState.siblings('.marker').hide();
                } else {
                    selectDonorState.prop('required', true).addClass('required');
                    selectDonorState.siblings('.marker').show();
                }
            });
            // });

            // watch country change (acknowledgee)
            selectAckCountry.on('change', function() {
                // load states
                $.get(BBI.Defaults.rootPath + 'webapi/country/' + $(this).val() + '/state', function(states) {
                    selectAckState.html('');
                    for (var i = 0, j = states.length; i < j; i++) {
                        selectAckState.append('<option value="' + states[i].Abbreviation + '">' + states[i].Description + '</option>');
                    }
                    selectAckState.prepend('<option value="-1">State/Territory</option>').val('-1');
                }).done(function() {
                    if (selectAckState.find('option').length < 2) {
                        selectAckState.removeAttr('required').removeClass('required');
                        selectAckState.siblings('.marker').hide();
                    } else {
                        selectAckState.prop('required', true).addClass('required');
                        selectAckState.siblings('.marker').show();
                    }
                });
            });
        },

        formatAmount: function() {
            $("input[data-type='currency']").on({
                keyup: function () {
                    formatCurrency($(this));
                },
                blur: function () {
                    formatCurrency($(this), "blur");
                }
            });

            function formatNumber(n) {
                // format number 1000000 to 1,234,567
                return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }

            function formatCurrency(input, blur) {
                // appends value, validates decimal side
                // and puts cursor back in right position.

                // get input value
                var input_val = input.val();

                // don't validate empty input
                if (input_val === "") {
                    return;
                }

                // original length
                var original_len = input_val.length;

                // initial caret position
                var caret_pos = input.prop("selectionStart");

                // check for decimal
                if (input_val.indexOf(".") >= 0) {
                    // get position of first decimal
                    // this prevents multiple decimals from
                    // being entered
                    var decimal_pos = input_val.indexOf(".");

                    // split number by decimal point
                    var left_side = input_val.substring(0, decimal_pos);
                    var right_side = input_val.substring(decimal_pos);

                    // add commas to left side of number
                    left_side = formatNumber(left_side);

                    // validate right side
                    right_side = formatNumber(right_side);

                    // On blur make sure 2 numbers after decimal
                    if (blur === "blur") {
                        right_side += "00";
                    }

                    // Limit decimal to only 2 digits
                    right_side = right_side.substring(0, 2);

                    // join number by .
                    input_val = left_side + "." + right_side;
                } else {
                    // no decimal entered
                    // add commas to number
                    // remove all non-digits
                    input_val = formatNumber(input_val);
                    input_val = input_val;

                    // final formatting
                    if (blur === "blur") {
                        input_val += ".00";
                    }
                }

                // send updated string to input
                input.val(input_val);

                // put caret back in the right position
                var updated_len = input_val.length;
                caret_pos = updated_len - original_len + caret_pos;
                input[0].setSelectionRange(caret_pos, caret_pos);
            }

        },

        formatDatepicker: function() {
            var d = new Date(),
                day = d.getDate();

            function getMinDate() {
                var date = new Date();
                if (day > 15) {
                    date.setMonth(date.getMonth() + 1, 1);
                } else if (day == 1) {
                    // set to current date
                } else {
                    date.setDate(15);
                }
                return date;
            }
            $("#startDate").datepicker({
                dateFormat: "m/d/yy",
                beforeShowDay: function(dt) {
                    return [
                        dt.getDate() == 1 || dt.getDate() == 15 ?
                        true :
                        false,
                    ];
                },
                minDate: getMinDate(),
            });
            $("#startDate").datepicker("setDate", getMinDate());
        },

        // get title table
        getTitle: function() {
            // var donorTitle = $('#personalTitle');

            // $.get(BBI.Defaults.rootPath + 'webapi/CodeTable/' + BBI.Defaults.titleTable, function(data) {
            //     for (var i = 0, j = data.length; i < j; i++) {
            //         console.log();
            //         // donorTitle.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
            //     }
            // }).done(function() {
            //     donorTitle.val('-1').change();
            // });

            codeTableService = new BLACKBAUD.api.CodeTableService();
            codeTableService.getTitles("456FFD4C-0FBF-49DB-A503-0726F86E2A39", function(d) {
                $.each(d, function() {
                    $("#personalTitle").append($("<option></option>").val(this["Description"]).text(this["Description"]));
                });
            });
        },

        // get title table
        populateTitle: function() {
            var selectAckTitle = $('#ackTitle');

            $.get(BLACKBAUD.api.pageInformation.rootPath + 'webapi/CodeTable/' + BBI.Defaults.titleTable, function(data) {
                for (var i = 0, j = data.length; i < j; i++) {
                    selectAckTitle.append('<option value="' + data[i].Id + '">' + data[i].Description + '</option>');
                }
            }).done(function() {
                selectAckTitle.val('-1').change();
            });
        },

        populateDesignationIds: function() {
            var queryService = new BLACKBAUD.api.QueryService();

            queryService.getResults(BBI.Defaults.highlightedFundsQueryId, function(data) {
                var fields = data.Fields,
                    rows = data.Rows,
                    fieldArray = [];
                $.each(fields, function(key, value) {
                    fieldArray[value.Name] = key;
                });
                $.each(rows, function() {
                    var values = this['Values'],
                        designationID = values[fieldArray['System record ID']],
                        designationName = values[fieldArray['Public name']], // use friendly name
                        itemHTML = '<li class="designationButton"><a rel="' + designationID + '">' + designationName + '</a></li>';
                    $('.designationButtonWrapper').append(itemHTML);
                });
                $('.designationButton a').on('click', function() {
                    $('.designationButton .selected').removeClass('selected');
                    $(this).addClass('selected');
                    $('#designationId').val($(this).attr('rel'));
                    $('#fundDesignation1').val('0');
                    $('#fundDesignation2').val('0').hide();
                });
            });
        },

        populateCascadingFields: function() {
            // get designations for drop-down (cascading)
            // note: must be attached to a query that returns Public Name and System Record ID
            var mainDesignation = $('#fundDesignation1');
            var subDesignation = $('#fundDesignation2');

            if ($(mainDesignation).length !== 0) {
                var queryService = new BLACKBAUD.api.QueryService();
                queryService.getResults(BBI.Defaults.cascadingFundsQueryId, function(data) {
                    // fund data
                    var allFunds = data.Rows;
                    var fundMaster = [];
                    var topLevelAll = [];

                    // remove all options in main drop-down except the first
                    $(mainDesignation).find('option').not('option:first').remove();

                    // get drop-down hierarchy and clean arrays
                    $.each(allFunds, function() {
                        // define values
                        var values = this.Values;
                        var target = values[3];
                        var splitter = target.split('\\');

                        // remove first item in array
                        if (splitter.length > 1) {
                            splitter.shift();
                        }

                        // push values to array
                        splitter.push(values[5]); // update key to match designation GUID
                        splitter.push(values[2]);
                        fundMaster.push(splitter);
                        topLevelAll.push(splitter[0]);
                        // console.log(fundMaster);
                    });

                    // filter unique values
                    function onlyUnique(value, index, self) {
                        return self.indexOf(value) === index;
                    }

                    var topLevelUnique = topLevelAll.filter(onlyUnique);

                    $.each(topLevelUnique, function(key, value) {
                        $(mainDesignation).append($("<option></option>").val(value).text(value));
                    });

                    // category drop-down
                    $(mainDesignation).on('change', function() {
                        // remove selected class from designation buttons
                        $('.designationButton .selected').removeClass('selected');

                        // define designation selection
                        var selection = $(this).val();

                        // remove all options in sub drop-down except the first
                        $(subDesignation).find('option').not('option:first').remove();

                        // loop through funds
                        $.each(fundMaster, function(x, subFund) {
                            // append GUID if terminal
                            if (subFund[0] === selection) {
                                $(subDesignation).append($("<option></option>").val(subFund[1]).text(subFund[2]));
                            }
                        });

                        // toggle designation drop-down
                        if ($(this).val() === '0') {
                            $(subDesignation).hide();
                        } else {
                            $(subDesignation).show();
                        }
                    });
                });
            }
        },

        initAdfTabs: function() {
            //default state
            $('#adfTributToggle').show();
            $('#adfFrequency').hide();

            $('#adfTabsMenu a').on('click', function() {
                var tabReference = $(this).attr('id');
                $('#adfTabsMenu .selected').removeClass('selected');
                $(this).parent('li').addClass('selected');
                //handle states of form
                if (tabReference === 'tabRecurring') {
                    $('#adfTributToggle').hide();
                    $('#adfFrequency').show();

                } else if (tabReference === 'tabPledge') {
                    $('#adfFrequency').hide();

                } else if (tabReference === 'tabFaculty') {
                    $('#adfFrequency').hide();

                } else { //tabOneTime
                    //default state
                    $('#adfTributToggle').show();
                    $('#adfFrequency').hide();

                }
            });

        },

        validateADF: function() {
            var ValidationMessage = [];
            var isValid = true;
            $('.required:visible').each(function() {
                if ($.trim($(this).val()) === '' || $(this).val() == '-1') {
                    var requiredFieldMessage = '<span class="invalidLabel adfNote"><i class="fa fa-exclamation-circle"></i>This is a required field.</span>';
                    isValid = false;
                    $(this).addClass('invalid');
                    $(this).after(requiredFieldMessage);
                }
            });
            if ($('#giftListEmpty').is(':visible')) {
                // console.log(isValid + ":(");
                isValid = false;
                $('.BBFormValidatorSummary').html('<p class="giftAmountError">Please add an item to your cart.</p>');
            }
            $('.invalid').first().focus();
            $('.invalid').on('keydown', function() {
                $(this).unbind('keydown');
                $(this).removeClass('invalid');
                $(this).parent().find('.invalidLabel').remove();
            });
            return isValid;
        },

        // validate ADF - Faculty Staff Form
        validateADF1: function() {
            // define validation status
            var isValid = true;

            // toggle validation classes on field edit
            $('.required:visible').each(function() {
                if ($.trim($(this).val()) === '' || $(this).val() === '-1' || $(this).is(':invalid')) {
                    isValid = false;
                    $(this).addClass('invalid');
                    $(this).parent().addClass('has-error');
                    $('html, body').stop().animate({
                        scrollTop: $('.invalid:first-of-type').offset().top - 100
                    }, 300);
                    $('#adfError').show();
                }
            });

            // focus on first invalid field
            $('.invalid:visible').first().focus();

            // toggle validation state on field edit
            $('.invalid').on('change keydown', function() {
                $(this).removeClass('invalid').parent().removeClass('has-error');

                if ($('.has-error').length === 0) {
                    // hide error
                    $('#adfError').hide();
                }
            });

            // return validation status
            return isValid;
        },

        submitADF: function() {
            var partId = $('.BBDonationApiContainer').attr('data-partid'),
                donationService = new BLACKBAUD.api.DonationService(partId, {
                    url: BBI.Defaults.rootpath,
                    crossDomain: false
                }),
                giftAmount = $('#txtAmount').val(),
                designationID = $('#designationId').val(),
                customAttributes = [],
                designationArray = [];

            var donation = {
                "Gift": {
                    "Designations": [],
                    "IsAnonymous": false,
                    "MerchantAccountId": BBI.Defaults.MerchantAccountId
                }
            };

            // if the path contains "/givetoday",
            // this is an appeal, so let's add the ID
            if (window.location.pathname.toLowerCase().startsWith('/givetoday')) {
                var origin = {
                    "AppealId": "BF7730F5-C275-4C2F-A08C-A33A29F2FBBA",
                    "PageId": BLACKBAUD.api.pageInformation.pageId
                    //, "PageName": "Advanced Donation Form"
                }

                donation.Origin = origin;
            }


            // if the path contains "/impact2016"
            // Appeal: FY17 Faculty & Staff Campaign
            // this is an appeal, so let's add the ID
            if (window.location.pathname.toLowerCase().startsWith('/impact2016')) {
                var origin = {
                    "AppealId": "b76d6373-51f0-4268-a35c-92bb1c8de65f",
                    "PageId": BLACKBAUD.api.pageInformation.pageId
                    //, "PageName": "Advanced Donation Form"
                }

                donation.Origin = origin;
            }


            // if the path contains "/impact16"
            // Appeal: FY17 Faculty & Staff Campaign 
            // this is an appeal, so let's add the ID
            if (window.location.pathname.toLowerCase().startsWith('/givetoday')) {
                var origin = {
                    "AppealId": "55a0b0ac-ed24-470e-b42f-5a537eca152f",
                    "PageId": BLACKBAUD.api.pageInformation.pageId
                    //, "PageName": "Advanced Donation Form"
                }

                donation.Origin = origin;
            }

            if ($('#anonymous:checked').length !== 0) {
                donation.Gift.IsAnonymous = true;
            }

            //other area free text entry
            if ($('#giftListNotEmpty .otherDesignation').length !== 0) {
                donation.Gift.Comments = "Area of support: " + $('#giftListNotEmpty .otherDesignation .fund-name').text();
            }

            if ($('#fundDesignation2 option:selected').val() !== "0") {
                designationID = $('#fundDesignation2 option:selected').val();
            }

            /*if ($('#adfTributToggle > label > input:checked').length !== 0) {
                var Tribute = {};
                if ($('#isTributeNotification:checked').length !== 0) {
                    Tribute.Acknowledgee = {
                        "FirstName" : $('#ackFirstName').val(),
                        "LastName" : $('#ackLastName').val(),
                        "AddressLines" : $('#ackAddressLines').val(),
                        "City" : $('#ackCity').val(),
                        "Country" : $('#ackCountry').val(),
                        "Email" : $('#ackEmail').val(),
                        "Phone" : $('#ackPhone').val(),
                        "PostalCode" : $('#ackPostalCode').val(),
                        "State" : $('#ackState').val()
                    };
                }
                Tribute.TributeDefinition = {
                        "Type" : $('#tributeType').val(),
                        "FirstName": $('#honoreeFirstName').val(),
                        "LastName": $('#honoreeLastName').val(),
                        "Description": $('#tributeType').val()
                };
                donation.Gift.Tribute = Tribute;
            }*/

            // tribute (honoree) attributes
            if ($('#adfTributToggle > label > input:checked').length !== 0) {
                if ($('#tributeType:visible').length !== 0) {
                    var tributeType = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Tribute Gift Type'],
                        "Value": $('#tributeType').val()
                    };
                    customAttributes.push(tributeType);
                }

                if ($('#honoreeFirstName').length !== 0 && $('#honoreeLastName').length !== 0) {
                    var honoreeName = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Honoree Name'],
                        "Value": $('#honoreeFirstName').val() + ' ' + $('#honoreeLastName').val()
                    };
                    customAttributes.push(honoreeName);
                }
            }

            // acknowledgee attributes
            if ($('#ackCheck > input:checked').length !== 0) {
                if ($('#ackTitle').length !== 0 && $('#ackTitle').val() !== '-1') {
                    var ackTitle = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Title'],
                        "Value": $('#ackTitle option:selected').text()
                    };
                    customAttributes.push(ackTitle);
                }

                if ($('#ackFirstName').length !== 0) {
                    var ackFirstName = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee First Name'],
                        "Value": $('#ackFirstName').val()
                    };
                    customAttributes.push(ackFirstName);
                }

                if ($('#ackLastName').length !== 0) {
                    var ackLastName = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Last Name'],
                        "Value": $('#ackLastName').val()
                    };
                    customAttributes.push(ackLastName);
                }

                if ($('#ackAddressLines').length !== 0) {
                    var ackAddress = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Address'],
                        "Value": $('#ackAddressLines').val()
                    };
                    customAttributes.push(ackAddress);
                }

                if ($('#ackCity').length !== 0) {
                    var ackCity = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee City'],
                        "Value": $('#ackCity').val()
                    };
                    customAttributes.push(ackCity);
                }

                if ($('#ackState').length !== 0) {
                    var ackState = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee State'],
                        "Value": $('#ackState').val()
                    };
                    customAttributes.push(ackState);
                }

                if ($('#ackPostalCode').length !== 0) {
                    var ackZip = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Zip'],
                        "Value": $('#ackPostalCode').val()
                    };
                    customAttributes.push(ackZip);
                }

                if ($('#ackCountry').length !== 0) {
                    var ackCountry = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Country'],
                        "Value": $('#ackCountry').val()
                    };
                    customAttributes.push(ackCountry);
                }

                if ($('#ackPhone').length !== 0 && $('#ackPhone').val() !== '') {
                    var ackPhone = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Phone'],
                        "Value": $('#ackPhone').val()
                    };
                    customAttributes.push(ackPhone);
                }

                if ($('#ackEmail').length !== 0 && $('#ackEmail').val() !== '') {
                    var ackEmail = {
                        "AttributeId": BBI.Defaults.customADFAttributes['Acknowledgee Email'],
                        "Value": $('#ackEmail').val()
                    };
                    customAttributes.push(ackEmail);
                }

                // not on form
                if ($('#ackClassYear:visible').length !== 0) {
                    var ackClassYear = {
                        "AttributeId": BBI.Defaults.customADFAttributes['UC Graduation Year'],
                        "Value": $('#ackClassYear').val()
                    };
                    customAttributes.push(ackClassYear);
                }

                // not on form
                if ($('#ackDegree:visible').length !== 0) {
                    var ackDegree = {
                        "AttributeId": BBI.Defaults.customADFAttributes['UC Graduation Degree'],
                        "Value": $('#ackDegree').val()
                    };
                    customAttributes.push(ackDegree);
                }
            }

            if ($('#company:visible').length !== 0) {
                var company = {
                    "AttributeId": BBI.Defaults.customADFAttributes['Matching Gift Company'],
                    "Value": $('#company').val()
                };
                customAttributes.push(company);
            }

            if ($('#spouseName:visible').length !== 0) {
                var spouseName = {
                    "AttributeId": BBI.Defaults.customADFAttributes['Joint Spouse Name'],
                    "Value": $('#spouseName').val()
                };
                customAttributes.push(spouseName);
            }

            if ($('#pledgeID:visible').length !== 0) {
                var pledge = {
                    "AttributeId": BBI.Defaults.customADFAttributes['Pledge ID'],
                    "Value": $('#pledgeID').val()
                };
                customAttributes.push(pledge);
            }

            if ($('#frequency:visible').length !== 0) {
                var startDate = Date.parse();
                var endDate = ($('#endDate').val().length !== 0) ? $('#endDate').val() : null;
                donation.Gift['Recurrence'] = {
                    "DayOfMonth": 1,
                    "Frequency": $('#frequency').val(),
                    "StartDate": $('#startDate').val(),
                    "EndDate": endDate
                };
            }

            /*if ($('#otherArea:visible').length !== 0 && $('#otherArea:visible').val().length > 0) {
                var otherArea = {
                    "Value": $('#otherArea').val()
                };
                donation.Gift.Comments.push(otherArea);
            }*/

            donation.Gift.Attributes = customAttributes;

            // one-time gift
            if ($('#tabOneTime').parent().hasClass('selected')) {
                var giftRow = $('#giftListNotEmpty > table > tbody > tr');
                $.each(giftRow, function() {
                    var fundAmount = $(this).find('.fund-amount').text().replace('$', '');
                    var fundDesignation = $(this).find('.fund-designation').text();
                    var gift = {
                        "Amount": fundAmount,
                        "DesignationId": fundDesignation
                    };
                    designationArray.push(gift);
                });

                donation.Gift.Designations = designationArray;
                // console.log(designationArray);
                // pledge gift
            } else {
                if ($('.amountButton a').hasClass('selected')) {
                    donation.Gift.Designations = [{
                        'Amount': $('.amountButton a.selected').attr('rel'),
                        'DesignationId': BBI.Defaults.pledgeFund
                    }];
                } else if (!$('.amountButton').hasClass('selected') && $('#txtAmount').val() !== '') {
                    donation.Gift.Designations = [{
                        'Amount': $('#txtAmount').val(),
                        'DesignationId': BBI.Defaults.pledgeFund
                    }];
                }
            }

            donationSuccess = function(data) {
                // no action, automatically forwards to payment part
                // console.log(data);
            };

            donationFail = function(d) {
                $('.BBFormValidatorSummary').html('<p>' + BBI.Methods.convertErrorsToHtml(d) + '</p>');
                $('#adfSubmitButton').on('click', function(e) {
                    e.preventDefault();
                    if (BBI.Methods.validateADF()) {
                        $(this).addClass('disabled').unbind('click');
                        BBI.Methods.submitADF();
                    }
                }).removeClass('disabled');
            };
            // console.log(donation);
            donationService.createDonation(donation, donationSuccess, donationFail);

        },

        // gift options
        giftOptions: function() {
            // field variables
            var onetimeGift = $('#onetimeGift'),
                recurringGift = $('#recurringGift'),
                recurringGiftSection = $('#recurringGiftSection'),
                startDate = $('#startDate'),
                endingDate = $('#endingDate'),
                pledgeGift = $('#pledgeGift'),
                pledgeGiftSection = $('#pledgeGiftSection'),
                tributeGift = $('#tributeGift'),
                honoreeSection = $('#honoreeSection'),
                acknowledgeeLetter = $('#ackLetter'),
                acknowledgeeSection = $('#acknowledgeeSection'),
                matchingGift = $('#matchingGift'),
                matchingGiftSection = $('#matchingGiftSection'),
                corpGift = $('#corporateGift'),
                corpGiftSection = $('#corporateGiftSection');

            // one-time gift selection
            onetimeGift.on('change', function() {
                if (recurringGift.is(':checked')) {
                    recurringGift.click();
                }
                if (pledgeGift.is(':checked')) {
                    pledgeGift.click();
                }
            });

            // recurring gift selection
            startDate.on('change', function() {
                $('#startDate').attr('data-date', $(this).val());
            });

            // recurring gift selection
            recurringGift.on('change', function() {
                if ($(this).is(':checked')) {
                    // show recurring gift fields
                    recurringGiftSection.removeClass('hidden');

                    // hide pledge gift checkbox
                    // pledgeGift.parent().addClass('hidden');

                    // uncheck one-time gift checkbox if checked
                    if (onetimeGift.is(':checked')) {
                        onetimeGift.click();
                    }

                    // uncheck pledge gift checkbox if checked
                    if (pledgeGift.is(':checked')) {
                        pledgeGift.click();
                    }

                    // hide tribute checkbox
                    tributeGift.parent().addClass('hidden');

                    // uncheck tribute checkbox if checked
                    if (tributeGift.is(':checked')) {
                        tributeGift.click();
                    }

                    // uncheck acknowledgee checkbox if checked
                    if (acknowledgeeLetter.is(':checked')) {
                        acknowledgeeLetter.click();
                    }
                } else {
                    // hide recurring gift fields
                    recurringGiftSection.addClass('hidden');

                    // show pledge gift checkbox
                    pledgeGift.parent().removeClass('hidden');

                    // show tribute checkbox
                    tributeGift.parent().removeClass('hidden');
                }

                // toggle ending date section
                if (endingDate.is(':checked') && !$(this).is(':checked')) {
                    endingDate.click();
                }
            });

            // optional end date selection
            endingDate.on('change', function() {
                if ($(this).is(':checked')) {
                    $(this).closest('.row').next('.row').removeClass('hidden');
                } else {
                    $(this).closest('.row').next('.row').addClass('hidden');
                }
            });

            // pledge gift selection
            pledgeGift.on('change', function() {
                if ($(this).is(':checked')) {
                    // show pledge gift fields
                    pledgeGiftSection.removeClass('hidden');

                    // hide recurring checkbox
                    // recurringGift.parent().addClass('hidden');

                    // uncheck one-time gift checkbox if checked
                    if (onetimeGift.is(':checked')) {
                        onetimeGift.click();
                    }

                    // uncheck recurring checkbox if checked
                    if (recurringGift.is(':checked')) {
                        recurringGift.click();
                    }

                    // uncheck acknowledgee checkbox if checked
                    if (acknowledgeeLetter.is(':checked')) {
                        acknowledgeeLetter.click();
                    }

                    // hide tribute checkbox
                    tributeGift.parent().addClass('hidden');

                    // uncheck tribute checkbox if checked
                    if (tributeGift.is(':checked')) {
                        tributeGift.click();
                    }
                } else {
                    // hide pledge gift fields
                    pledgeGiftSection.addClass('hidden');

                    // show recurring checkbox
                    recurringGift.parent().removeClass('hidden');

                    // show tribute checkbox
                    tributeGift.parent().removeClass('hidden');
                }
            });

            // tribute selection
            tributeGift.on('change', function() {
                if ($(this).is(':checked')) {
                    // show honoree section
                    honoreeSection.removeClass('hidden');

                    // hide recurring gift section
                    recurringGiftSection.addClass('hidden');
                    recurringGift.parent().addClass('hidden');

                    // hide pledge gift section
                    pledgeGiftSection.addClass('hidden');
                    pledgeGift.parent().addClass('hidden');

                    // document.getElementById("numberOfInstallments").value = "1";

                    // var radiobtn = document.getElementById("OneTime");
                    // radiobtn.checked = true;

                    // document.getElementById("installmentAmount").value = document.getElementById("totalGift").value;
                } else {
                    // hide honoree and acknowledgee sections
                    honoreeSection.addClass('hidden');
                    acknowledgeeSection.addClass('hidden');

                    // show recurring gift checkbox
                    recurringGift.parent().removeClass('hidden');

                    // show pledge gift checkbox
                    pledgeGift.parent().removeClass('hidden');
                }

                // toggle acknowledgee section
                if (acknowledgeeLetter.is(':checked') && !$(this).is(':checked')) {
                    acknowledgeeLetter.click();
                }
            });

            // acknowledgee selection
            acknowledgeeLetter.on('change', function() {
                if ($(this).is(':checked')) {
                    // show acknowledgee section
                    acknowledgeeSection.removeClass('hidden');
                } else {
                    // hide acknowledgee section
                    acknowledgeeSection.addClass('hidden');
                }
            });

            // matching gift selection
            matchingGift.on('change', function() {
                if ($(this).is(':checked')) {
                    // show matching gift section
                    matchingGiftSection.removeClass('hidden');

                    // hide corporate gift checkbox
                    corpGift.parent().addClass('hidden');
                } else {
                    // hide matching gift section
                    matchingGiftSection.addClass('hidden');

                    // show corporate gift checkbox
                    corpGift.parent().removeClass('hidden');
                }
            });

            // corporate gift selection
            corpGift.on('change', function() {
                if ($(this).is(':checked')) {
                    // show company name section
                    corpGiftSection.removeClass('hidden');

                    // hide matching gift checkbox
                    matchingGift.parent().addClass('hidden');

                    // uncheck matching gift checkbox if checked
                    if (matchingGift.is(':checked')) {
                        matchingGift.click();
                    }
                } else {
                    // hide company name section
                    corpGiftSection.addClass('hidden');

                    // show matching gift checkbox
                    matchingGift.parent().removeClass('hidden');
                }
            });
        },

        foundationbgFix: function() {
            // Derry Spann Added JS fix
            var wwidth = $(window).width();
            // toggle responsive menu classes for sub menus
            if (wwidth <= 816) {
                var mobileHeroBg = $('.wrapBreadcrumbs img').first().hide().attr('src');
                if (mobileHeroBg) {
                    $('.fullWidthBackgroundImage').css({
                        'display': 'block',
                        //'height': '94vh',
                        'position': 'relative',
                        'background-image': 'url(' + mobileHeroBg + ')',
                        'background-size': 'cover',
                        'margin-top': '90px'
                    });
                } else {
                    $('.fullWidthBackgroundImage').removeAttr("style");
                }
            }

        },

        buildSocialButtons: function() {

            if ($('.socialButtonTable').length > 0) {
                function popUp(url) {
                    socialWindow = window.open(url, "littleWindow", "location=no,width=600,height=500,left=300,top=300");
                }
                $(".socialButtonTable").each(function() {
                    var buttonType = $(this).find(".socialButtonType").text();
                    var buttonClass = "";
                    var buttonText = $(this).find(".socialButtonText").text();
                    var buttonContent = $(this).find(".socialButtonContent").text();
                    var url = "";

                    if (buttonType.match("Facebook")) {
                        //buttonClass="btn-facebook";url = "http://www.facebook.com/sharer/sharer.php?s=100&p[url]=www.CLIENTURL.org&p[title]=CLIENTNAME&p[summary]=";
                        buttonClass = "btn-facebook";
                        //url = "www.facebook.com";
                        url = "http://www.facebook.com/sharer.php?u=" + buttonContent;
                    } else if (buttonType.match("Twitter")) {
                        buttonClass = "btn-twitter";
                        //buttonContent = escape(buttonContent);
                        url = "http://twitter.com/intent/tweet?text=" + buttonContent;
                    } else {
                        // console.log("invalid button type: " + buttonType);
                    }
                    //$(this).after("<a class='btn-social "+buttonClass+"' target='_blank' href='"+url+buttonContent+"'><span class='icon'></span><span class='title'>"+buttonText+"</span></a>");
                    $(this).after("<a class='btn-social " + buttonClass + "' href='" + url + "'><span class='icon'></span><span class='title'>" + buttonText + "</span></a>");
                    $(this).hide();
                });

                $('.btn-social').each(function() {
                    $(this).click(function(e) {
                        e.preventDefault();
                        window.open($(this).attr('href'), 'title', 'width=600,height=400');
                        return false;
                    });
                });
            }
        },

        // api error handling
        convertErrorToString: function(error) {
            if (error) {
                if (error.Message)
                    return error.Message;
                switch (error.ErrorCode) {
                    case 101:
                        return error.Field + " is required.";
                    case 102:
                        return error.Field + " is invalid.";
                    case 103:
                        return error.Field + " is below minimum.";
                    case 104:
                        return error.Field + " exceeds maximum.";
                    case 105:
                        return error.Field + " is not valid.";
                    case 106:
                        return "Record for " + error.Field + " was not found.";
                    case 203:
                        return "Donation not completed on BBSP.";
                    case 107:
                        return "Max length for " + error.Field + " exceeded.";
                    default:
                        return "Error code " + error.ErrorCode + ".";
                }
            }
        },

        // convert errors to html
        convertErrorsToHtml: function(errors) {
            var i, message = "Unknown error.<br/>";
            if (errors) {
                message = "";
                for (i = 0; i < errors.length; i++) {
                    message = message + BBI.Methods.convertErrorToString(errors[i]) + "<br/>";
                }
            }
            return message;
        },

        adminStyleFixes: function() {
            $('[class*="show-for-"], [class*="hide-for-"], .fullWidthBackgroundImage, .fullWidthBackgroundImageInner').attr('class', '');
            $('header div').not('[id^="pane"], [id^="pane"] div').css('position', 'static');
            $('.fullWidthBackgroundImageInner').show();
        },

        getUrlVars: function() {
            // Gets variables and values from URL
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
                vars[key] = unescape(value.replace(/\+/g, " "));
            });
            return vars;
        },

        returnQueryValueByName: function(name) {
            return BLACKBAUD.api.querystring.getQueryStringValue(name);
        },

        fixPositioning: function() {
            // Fix positioning:
            $('div[id *= "_panelPopup"]').appendTo('body');
            $('div[id *= "_designPaneCloak"]').css({
                "top": "0px",
                "left": "0px"
            });
            $('.DesignPane').css("position", "relative");
        },

        setCookie: function(c_name, value, exdays) {
            var exdate = new Date();
            //allows for reading cookies across subdomains
            var cd = window.location.host.substr(window.location.host.indexOf("."));
            exdate.setDate(exdate.getDate() + exdays);
            var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value + "; domain=" + cd + "; path=/";
        },

        readCookie: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        initMobileHeader: function() {
            $("#mobileLogo").headroom({
                offset: 80
            });
        },

        mobileSubMenu: function() {
            $('.mobileCanvas.rightCanvas ul.menu li.parent > a').click(function(event) {
                if ($(this).parent().hasClass('open')) {
                    // open link
                } else {
                    event.preventDefault();
                    $(this).parent().toggleClass('open');
                    $(this).next().slideToggle();
                }
            });
        },

        jobOpportunities: function() {
            $('.job-title').click(function(event) {
                $(this).toggleClass('open').next().slideToggle('slow');
            });
            $('.close-description').click(function(event) {
                $(this).parents('.job-description').slideUp('slow').prev().removeClass('open');
            });
        },

        /**********************************************
        CUSTOM DONATION FORM
           Broken Down into 3 Objects by Step
        ***********************************************/

        customSingleDonationForm: {

            // Add Classes to parent Tbody of each section of the hidden form
            tbodyClasses: function() {
                // Set Vars
                var donationInfo, additionalInfo, designationSelectList, billingInfo, tributeInfo, paymentInfo;
                // Donation Information/Amount
                donationInfo = $('[id*="txtAmount"]').parents('tbody').addClass('donationInfo');
                // Additional Information
                additionalInfo = $('[id*="trDesignation"]').parents('tbody').addClass('additionalInfo');
                // Billing Information
                billingInfo = $('[id*="DonationCapture1_txtFirstName"]').parents('tbody').addClass('billingInfo');
                // Tribute Information
                tributeInfo = $('[id*="lblTributeHeading"]').parents('tbody').addClass('tributeInfo');
                // Tribute Name
                //tributeNameInput = '.tributeInfo [id*="trTributeName"] input[id*="txtTribute"]';
                // Tribute Type Select List
                //tributeTypeSelectList = '.tributeInfo [id*="trTributeDesc"] select[id*="ddlTribute"]';
                // Tribute Description Input
                //tributeDescInput = '.tributeInfo [id*="trTributeDesc2"] input[id*="txtTributeDescription"]';
                // Payment Information
                //paymentInfo = $('[id*="DonationCapture1_lblCardHoldersName"]').parents('tbody').addClass('paymentInfo');
            },

            /**********************************************
            Step 1 - Get Designation ID and Gift Amount
            ***********************************************/

            stepOneGivingDetails: {

                fundDesignationOption: function() {
                    var shownFundList, hiddenFundDesgList;
                    hiddenFundDesgList = $('.additionalInfo select[id*="ddlDesignations"]').children().clone();
                    $('<select id="fundDesignList"></select>').prependTo('ul.fundDesignation li.fundDesignationList');
                    shownFundList = 'select#fundDesignList';
                    if ($('ul.fundDesignation li.fundDesignationList select option').length === 0) {
                        $(hiddenFundDesgList).prependTo(shownFundList);
                    }
                    $('select#fundDesignList option').click(function() {
                        $('select#fundDesignList option:selected').removeAttr('checked', 'true');
                        $(this).attr('checked', 'true');
                    });

                    // Match Selected Fund to Hidden Fund
                    $(shownFundList).on('change', function() {
                        var shownFundListSelected = $('select#fundDesignList option:selected');
                        var hiddenFundList = '.additionalInfo select[id*="ddlDesignations"]';
                        $(hiddenFundList).find('option[value="' + shownFundListSelected.val() + '"]').attr('selected', true);
                    });
                },

                clickHiddenAmount: function() {
                    $('input[value="rdoOther"]').click(); // auto-select "Other" amount option in hidden form (on page load)
                    var checkedRadio = $('.givingAmountOptions input[name="amount"]:checked').val(); // set initial val for :checked option (on page load)
                    $('.DonationFormTable input[id$="txtAmount"]').val(checkedRadio);
                },

                // Donation Amount
                donationAmount: function() {
                    $('#addToCart a').on('click', function() {
                        var sum = 0;
                        // iterate through each amount cell and add the values
                        $('.fund-amount').each(function() {
                            var value = $(this).text().replace('$', '');
                            // add only if the value is number
                            if (!isNaN(value) && value.length != 0) {
                                sum += parseFloat(value);
                            }
                            $('.adfTotalAmount span').text(sum);
                        });
                    });
                    /*var otherAmountRadio = $('.givingAmountOptions .otherAmount input[type="radio"]#otherAmt');
                    var otherAmountText = $('.givingAmountOptions .otherAmount input[type="text"]');
                    var giftAmountShown = $('.givingAmountOptions input[type="radio"][id*="opt"]');
                    var giftAmountHidden = $('.DonationFormTable input[id$="txtAmount"]');
  
                    giftAmountShown.change(function() {
                        var rdoAmtChk = $('.givingAmountOptions input[type="radio"][id*="opt"]:checked').val();
                        otherAmountText.val('');
                        otherAmountText.attr('disabled', true);
                        giftAmountHidden.val(rdoAmtChk);
                    });
  
                    otherAmountRadio.click(function() {
                       otherAmountText.attr('disabled', false);
                    });
  
                    otherAmountText.keyup(function() {
                        giftAmountHidden.val($(this).val());
                    });*/
                }
            },


            /**********************************************
            Step 2 - GET DONOR NAME AND BILLING INFO
            ***********************************************/

            stepTwoDonorInfo: {

                // STEP 2A: GET BILLING NAME
                billingName: function() {
                    var billingFirstName, billingLastName, hiddenFirstName, hiddenLastName;
                    billingFirstName = '.donorFirstName #billingFirstName';
                    billingLastName = '.donorLastName #billingLastName';
                    hiddenFirstName = '.billingInfo [id*="txtFirstName"]';
                    hiddenLastName = '.billingInfo [id*="txtLastName"]';
                    // Get First Name entered
                    $(billingFirstName).blur(function() {
                        var billingFirstNameEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenFirstName).val(billingFirstNameEnt);
                        }
                    });
                    // Get Last Name entered
                    $(billingLastName).blur(function() {
                        var billingLastNameEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenLastName).val(billingLastNameEnt);
                        }
                    });
                },

                // STEP 2B: GET BILLING ADDRESS
                billingAddress: function() {
                    var billingAddress, hiddenBillingAddress;
                    billingAddress = '.personalInfoList #billingAddress';
                    hiddenBillingAddress = '.billingInfo [id*="AddressLine"]';
                    // Get Address entered
                    $(billingAddress).change(function() {
                        var billingAddressEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenBillingAddress).val(billingAddressEnt);
                        }
                    });
                },
                // STEP 2C: GET BILLING Title
                billingTitleList: function() {
                    var shownTitleList, hiddenTitleList;
                    hiddenTitleList = $('.DonationCaptureFormTable select[id*="Title"]').children().clone();
                    shownTitleList = '.donorTitle select#nameTitleList';
                    if ($('select#nameTitleList option').length === 0) {
                        $(hiddenTitleList).prependTo(shownTitleList);
                    }
                    $('#nameTitleList option:eq(0)').text('Title');
                    $('select#nameTitleList option').click(function() {
                        $('select#nameTitleList option:selected').removeAttr('checked', 'true');
                        $(this).attr('checked', 'true');

                    });
                    // Match Selected Fund to Hidden Fund
                    $(shownTitleList).on('change', function() {
                        var shownTitleListSelected = $('select#nameTitleList option:selected');
                        var hiddenTitleList = '.DonationCaptureFormTable select[id*="Title"]';
                        $(hiddenTitleList).find('option[value="' + shownTitleListSelected.val() + '"]').attr('selected', true);
                    });
                },
                // STEP 2D: GET BILLING City
                billingCity: function() {
                    var billingCity, hiddenCity;
                    billingCity = '.wrapCity #billingCity';
                    hiddenCity = '.billingInfo [id*="City"]';
                    // Get City entered
                    $(billingCity).blur(function() {
                        var billingCityEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenCity).val(billingCityEnt);
                        }
                    });
                },
                // STEP 2E: GET BILLING COUNTRY
                billingCountryList: function() {
                    var shownCountryList, hiddenCountryList;
                    hiddenCountryList = $('.DonationCaptureFormTable [id*="Country"]').children().clone();
                    shownCountryList = 'select#billingCountry';

                    if ($('select#billingCountry option').length === 0) {
                        $(hiddenCountryList).prependTo(shownCountryList);
                    }
                    /*
                    $('select#billingCountry option').click(function () {
                    $('select#billingCountry option:selected').removeAttr('selected', true);
                    $(this).attr('selected', true);
                    $(hiddenCountryList).find('option[value="' + $(this).val() + '"]')
                    .attr('selected', true);
                    $('.DonationCaptureFormTable [id*="Country"] option').trigger('change');
  
                              });
                    */

                    // Match Selected Fund to Hidden Fund
                    $('select#billingCountry option').click(function() {
                        var shownCountryListSelected = $('select#billingCountry option:selected');
                        var hiddenCountryList = '.DonationCaptureFormTable [id*="Country"]';
                        $(hiddenCountryList).find('option[value="' + shownCountryListSelected.val() + '"]')
                            .attr('selected', true);
                        var hiddenCountrySelected = $('.DonationCaptureFormTable [id*="Country"]').find('option:selected');
                        // $(hiddenCountrySelected).trigger('change');
                        // console.log(hiddenCountrySelected);
                    });
                },
                // STEP 2F: GET BILLING STATE
                billingStateList: function() {
                    var shownStateList, hiddenStateList;
                    hiddenStateList = $('.DonationCaptureFormTable [id*="State"]').children().clone();
                    shownStateList = 'select#billingState';
                    if ($('select#billingState option').length === 0) {
                        $(hiddenStateList).prependTo(shownStateList);
                    }
                    $('#billingState option:eq(0)').text('State');
                    $('select#billingState option').click(function() {
                        $('select#billingState option:selected').removeAttr('checked', 'true');
                        $(this).attr('checked', 'true');
                    });
                    // Match Selected State to Hidden State
                    $(shownStateList).on('change', function() {
                        var shownStateListSelected = $('select#billingState option:selected');
                        var hiddenStateList = '.DonationCaptureFormTable [id*="State"]';
                        $(hiddenStateList).find('option[value="' + shownStateListSelected.val() + '"]').attr('selected', true);
                    });
                },
                // STEP 2G: GET BILLING ZIP
                billingZip: function() {
                    var billingZip, hiddenZip;
                    billingZip = '.wrapZip #zip';
                    hiddenZip = '.DonationFormTable [id*="Zip"]';
                    // Grab ZIP entered
                    $(billingZip).blur(function() {
                        var billingZipEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenZip).val(billingZipEnt);
                        }
                    });
                },
                // STEP 2H: GET BILLING PHONE
                billingPhone: function() {
                    var billingPhone, hiddenBillingPhone;
                    billingPhone = '.personalInfoList #billingPhone';
                    hiddenBillingPhone = '.billingInfo [id*="txtPhone"]';
                    // Grab Phone value
                    $(billingPhone).blur(function() {
                        var billingPhoneEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenBillingPhone).val(billingPhoneEnt);
                        }
                    });
                },
                // STEP 2I: GET BILLING EMAIL
                billingEmail: function() {
                    var billingEmail, hiddenBillingEmail;
                    billingEmail = '.personalInfoList #email';
                    hiddenBillingEmail = '.billingInfo [id*="txtEmailAddress"]';
                    // Grab Email value
                    $(billingEmail).blur(function() {
                        var billingEmailEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenBillingEmail).val(billingEmailEnt);
                        }
                    });
                },
            },

            /**********************************************
            Step 3 - PAYMENT INFO HANDLER
            ***********************************************/

            stepThreePaymentInfo: {

                // PART 3A:
                // GET CARDHOLDER NAME AND VALIDATE ON KEYUP
                cardholder: function() {
                    var cardholder, hiddenCardholder;
                    cardholder = '.paymentInfo #cardholder';
                    hiddenCardholder = '.paymentInfo [id*="txtCardholder"]';
                    // Get Cardholder Name entered
                    $(cardholder).keyup(function() {
                        var cardHolderEnt = $(this).val();
                        if ($(this).val() !== '') {
                            $(hiddenCardholder).val(cardHolderEnt);
                        }
                    });
                },

                // PART 3B:
                // GET CARD NUMBER, VALIDATE, AND UPDATE CLASS
                cardNumber: function() {
                    var cardNumber, hiddenCardNumber, cardTypeEnt, creditCardValidator, cardTypeVisa, cardTypeMasterCard, cardTypeAmEx, cardTypeDiscover, cardTypeInvalid, cardType;
                    cardNumber = '.paymentInfo #cardNumber';
                    hiddenCardNumber = 'table.DonationFormTable input[id*="txtCardNumber"]'; // RegEx Cardnumber Pattern
                    creditCardValidator = new RegExp(/^\d{4}-?\d{4}-?\d{4}-?\d{3,4}$/); // Visa Card Type
                    cardTypeVisa = new RegExp(/^4$/); // MasterCard Card Type
                    cardTypeMasterCard = new RegExp(/^5$/); // American Express Card Type
                    cardTypeAmEx = new RegExp(/^3$/); // Discover Card Type
                    cardTypeDiscover = new RegExp(/^6$/); // Invalid Card Type
                    cardTypeInvalid = new RegExp(/^(0|1|2|7|8|9)$/); // Dynamic text of card type selected
                    cardType = '.cardTypeEnt';
                    cardTypeEnt = $(cardType).text(); // Get Card Number entered

                    // Match Number to CardType on Keyup
                    $(cardNumber).keyup(function() {
                        // console.log("cardNumber keyup");
                        if ($(this).val().match(cardTypeVisa)) {
                            $(this).removeClass().addClass('cardTypeVisa');
                            $(cardType).html('Visa');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(Visa)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeMasterCard)) {
                            $(this).removeClass().addClass('cardTypeMasterCard');
                            $(cardType).html('MasterCard');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(MasterCard)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeAmEx)) {
                            $(this).removeClass().addClass('cardTypeAmEx');
                            $(cardType).html('American Express');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(American)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeDiscover)) {
                            $(this).removeClass().addClass('cardTypeDiscover');
                            $(cardType).html('Discover');
                            $('table.DonationFormTable select[id*="cboCardType"]').find('option:contains(Discover)').attr('selected', 'selected');
                        } else if ($(this).val().match(cardTypeInvalid) || $(this).val() === '') {
                            $(this).removeClass().addClass('cardTypeInvalid');
                            $('.cardTypeEnt').text('');
                        }
                    });
                    $('.cardTypeEnt').text(cardTypeEnt); // Get Card Type Based on Card Number

                    // Grab Credit Card value
                    $(cardNumber).keyup(function() {
                        var cardNumEnt = $(cardNumber).val();
                        if ($(this).val().match(creditCardValidator)) {
                            $(this).removeClass('invalid').addClass('valid');
                            $('input[id*="DonationCapture1_txtCardNumber"]').val(cardNumEnt);
                        } else {
                            $(this).removeClass('valid').addClass('invalid');
                        }
                    });

                    // Validate and Update Class
                    $(cardNumber).blur(function() {
                        var cardNumEnt = $(cardNumber).val();
                        if ($(this).val().match(creditCardValidator)) {
                            $(this).removeClass('invalid').addClass('valid');
                            $('input[id*="DonationCapture1_txtCardNumber"]').val(cardNumEnt);
                        } else {
                            $(this).removeClass('valid').addClass('invalid');
                        }
                    });

                },

                // PART 3C:
                // CARD EXPIRATION HANDLER
                cardExp: function() {
                    var cardExpMonth, cardExpYear, hiddenCardExpMonth, hiddenCardExpYear, hiddenCardExpMonthClone, hiddenCardExpYearClone; // Card Expiration Month
                    cardExpMonth = 'select#cardExpMonth'; // Card Expiration Year
                    cardExpYear = 'select#cardExpYr'; // Hidden Exp Month
                    hiddenCardExpMonth = 'table.DonationFormTable select[id*="cboMonth"]'; // Hidden Exp Year
                    hiddenCardExpYear = 'table.DonationFormTable select[id*="cboYear"]'; // Clone Hidden Exp Month
                    hiddenCardExpMonthClone = $(hiddenCardExpMonth).children().clone(); // Clone Hidden Exp Year
                    hiddenCardExpYearClone = $(hiddenCardExpYear).children().clone(); // Build Card Exp Year Select list Options
                    if ($('select#cardExpMonth option').length === 0) {
                        $(hiddenCardExpMonthClone).appendTo('select#cardExpMonth');
                        $('select#cardExpMonth option:eq(0)').text('Month');
                    }

                    // Grab Card Exp Month
                    $(cardExpMonth).change(function() {
                        var cardExpMonthSelected = $('select#cardExpMonth :selected').val();
                        $(hiddenCardExpMonth).find('option:contains("' + cardExpMonthSelected + '")').attr('selected', 'selected');
                    });

                    // Grab Hidden Values and Append to this Dropdown
                    if ($('select#cardExpYr option').length === 0) {
                        $(hiddenCardExpYearClone).appendTo('select#cardExpYr');
                        $('select#cardExpYr option:eq(0)').text('Year');
                    }

                    // Grab Card Exp Year
                    $(cardExpYear).change(function() {
                        var cardExpYearSelected = $('select#cardExpYr :selected').val();
                        $(hiddenCardExpYear).find('option:contains("' + cardExpYearSelected + '")').attr('selected', 'selected');
                        // console.log('Year selected');
                    });
                },

                // PART 3D:
                // EXTRACT ALL CSC VALUES
                cardCSC: function() {
                    var cardSecCode, cscValidator, hiddenCardSecurityCode;
                    cardSecCode = 'input#cscCode'; // Card Security Code
                    cscValidator = new RegExp(/^\d{3,4}$/); // CSC Validation RegEx Pattern
                    hiddenCardSecurityCode = 'table.DonationFormTable input[id*="txtCSC"]'; // Hidden/Old Form Vars

                    // Validate CSC Field and Update Class
                    $(cardSecCode).blur(function() {
                        var cscEnt = $(cardSecCode).val();
                        if (!$(this).val().match(cscValidator)) {
                            $(this).addClass('invalid');
                        } else {
                            $(this).removeClass('invalid').addClass('valid');
                            $(hiddenCardSecurityCode).val(cscEnt);
                            //$('.paymentInfo ul.paymentInfo li[class*="card"]').addClass('siblingsComplete');
                            $('.paymentInfo h3').addClass('complete');
                        }
                    });
                },

                // PART 6: STORE HIDDEN DATA AND UPDATE IF NEEDED
                hiddenDataPersistence: function() {
                    var error = $('div[id$=ValidationSummary1]');
                    if (error.children().length > 0) {
                        var billingFirstName = '.donorFirstName #billingFirstName';
                        var hiddenFirstName = '.billingInfo [id*="txtFirstName"]';
                        var hiddenFirstNameEnt = $(hiddenFirstName).val();
                        $(billingFirstName).val(hiddenFirstNameEnt);
                        var billingLastName = '.donorLastName #billingLastName';
                        var hiddenLastName = '.billingInfo [id*="txtLastName"]';
                        var hiddenLastNameEnt = $(hiddenLastName).val();
                        $(billingLastName).val(hiddenLastNameEnt);
                        var billingAddress = '.personalInfoList #billingAddress';
                        var hiddenBillingAddress = 'textarea[id$="AddressLine"]';
                        var hiddenAddressEnt = $(hiddenBillingAddress).val();
                        $(billingAddress).val(hiddenAddressEnt);
                        var billingCity = '.wrapCity #billingCity';
                        var hiddenCity = 'input[id$="CityUS"]';
                        var hiddenCityEnt = $(hiddenCity).val();
                        $(billingCity).val(hiddenCityEnt);
                        var billingZip = '.wrapZip #zip';
                        var hiddenZip = 'input[id$="ZipUS"]';
                        var hiddenZipEnt = $(hiddenZip).val();
                        $(billingZip).val(hiddenZipEnt);
                        var billingPhone = '.personalInfoList #billingPhone';
                        var hiddenBillingPhone = '.billingInfo [id*="txtPhone"]';
                        var hiddenPhoneEnt = $(hiddenBillingPhone).val();
                        $(billingPhone).val(hiddenPhoneEnt);
                        var billingEmail = '.personalInfoList #email';
                        var hiddenBillingEmail = '.billingInfo [id*="txtEmailAddress"]';
                        var hiddenEmailEnt = $(hiddenBillingEmail).val();
                        $(billingEmail).val(hiddenEmailEnt);
                    }
                },

                autoFillExtraction: function() {

                    // CHECK IF DESIGNATION PRESENT
                    var designationCheck = $('span[id$=DesignationValue]').text();
                    $("#fundDesignList").append($('<option>', {
                        value: designationCheck
                    }).text(designationCheck));

                    // PART 7: EXTRACT ALL VALUES
                    $('input#cscCode').blur(function() {
                        var billingFirstName = '.donorFirstName #billingFirstName';
                        var hiddenFirstName = '.billingInfo [id*="txtFirstName"]';
                        var billingFirstNameEnt = $(billingFirstName).val();
                        $(hiddenFirstName).val(billingFirstNameEnt);
                        var billingLastName = '.donorLastName #billingLastName';
                        var hiddenLastName = '.billingInfo [id*="txtLastName"]';
                        var billingLastNameEnt = $(billingLastName).val();
                        $(hiddenLastName).val(billingLastNameEnt);
                        var billingAddress = '.personalInfoList #billingAddress';
                        var hiddenBillingAddress = '.billingInfo [id*="AddressLine"]';
                        var billingAddressEnt = $(billingAddress).val();
                        $(hiddenBillingAddress).val(billingAddressEnt);
                        var billingCity = '.wrapCity #billingCity';
                        var hiddenCity = '.billingInfo [id*="City"]';
                        var billingCityEnt = $(billingCity).val();
                        $(hiddenCity).val(billingCityEnt);
                        var billingZip = '.wrapZip #zip';
                        var hiddenZip = '.DonationFormTable [id*="Zip"]';
                        var billingZipEnt = $(billingZip).val();
                        $(hiddenZip).val(billingZipEnt);
                        var billingPhone = '.personalInfoList #billingPhone';
                        var hiddenBillingPhone = '.billingInfo [id*="txtPhone"]';
                        var billingPhoneEnt = $(billingPhone).val();
                        $(hiddenBillingPhone).val(billingPhoneEnt);
                        var billingEmail = '.personalInfoList #email';
                        var hiddenBillingEmail = '.billingInfo [id*="txtEmailAddress"]';
                        var billingEmailEnt = $(billingEmail).val();
                        $(hiddenBillingEmail).val(billingEmailEnt);
                    });
                },
                submitButton: function() {
                    $('.DonationButtonCell input[type="submit"].DonationSubmitButton').prependTo('.submitButton');
                },

            }, // END STEP 3 PAYMENT INFO

            /* Animate Step Here */
            stepOneToggleAnimations: function() {
                $('.donateAmount h3').addClass('complete');
                $('.donorInfo .personalInfoList').removeClass('hide').slideDown();
                $('.donorInfo').find('h3').removeClass();
                $('#billingFirstName').focus();
            },

            stepToggles: function() {
                $('#wrapSingleGivingForm .givingAmountOptions .rdoAmount input[type="radio"]').click(function() {
                    if ($(this).is(':checked') && $('ul.giftType').length === 0) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                $('#wrapSingleGivingForm .givingAmountOptions .otherAmount input[type="text"]').blur(function() {
                    if ($(this).val() !== '' && $('ul.giftType').length === 0) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                $('#wrapSingleGivingForm .giftType li input[type="checkbox"]').click(function() {
                    if ($(this).is(':checked')) {
                        BBI.Methods.customSingleDonationForm.stepOneToggleAnimations();
                    }
                });
                /* STEP 3 HIDDEN Here */
                $('input#email[type="email"]').keyup(function() {
                    var emailValidator = new RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/);
                    if ($(this).val().match(emailValidator)) {
                        $('.paymentInfo').removeClass('hide').slideDown();
                        $('.donorInfo').find('h3').addClass('complete');
                        $('.paymentInfo').find('h3').removeClass();
                        //$('#cardholder').focus();
                    }
                });
                if ($('body').hasClass('Explorer')) {
                    $('.personalInfoList input#email').keyup(function() {
                        var emailValidator = new RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/);
                        if ($(this).val().match(emailValidator)) {
                            $('.paymentInfo').removeClass('hide').slideDown();
                            $('.donorInfo').find('h3').addClass('complete');
                            $('.paymentInfo').find('h3').removeClass();
                            //$('#cardholder').focus();
                        }
                    });
                }
            },

            hiddenFormValidation: function() {
                // Form Error(s) Text
                $('#wrapSingleGivingForm + [id*="UpdatePanel"] .DonationFormTable [id*="ValidationSummary1"].DonationValidationSummary').insertBefore('.donateAmount');
                // Form Submitted Text
                var forSubmittedText = $('[id*="lblThanks"].DonationMessage').insertBefore('.donateAmount');
                if ($(forSubmittedText).length) {
                    $('fieldset.step').hide();
                }

            },

        }, // END CUSTOM SINGLE DONATION

        resetBackgrounds: function() {
            $('.wrapBreadcrumbs p img').show();
            $("#internalPage .inner-wrap .siteWrapper .fullWidthBackgroundImage").removeAttr("style");
            BBI.Methods.foundationbgFix();
        }

    }
};

// If fund has been added to Gifts Summary, ask user if they are OK losing data upon reload.
const onConfirmRefresh = function(event) {
    // if has following classes/ID as parent
    // BBDonationApiContainer (ADF), PC#####_pnlDonationForm (Standard Donation Form)
    // If in Edit mode do nothing.
    if ($("body").hasClass(".AdminPageBody")) {
        // Do Nothing
    } else {
        if ($(".BBDonationApiContainer").is(":visible") || $("[id*='_pnlDonationForm']").is(":visible")) {
            event.preventDefault();
            return event.returnValue = "Are you sure you want to leave the page?";
        }
    }

}

// Ask if sure you want to leave page.

//   window.addEventListener("beforeunload", onConfirmRefresh, {
//     capture: true
//   });

// Run global scripts...
BBI.Methods.pageInit();

// reset the backgrounds when the screen width changes
var $window = $(window);
var lastWindowWidth = $window.width();

$window.resize(function() {
    /* Do not calculate the new window width twice.
     * Do it just once and store it in a variable. */
    var windowWidth = $window.width();

    /* Use !== operator instead of !=. */
    if (lastWindowWidth !== windowWidth) {
        // EXECUTE YOUR CODE HERE
        BBI.Methods.resetBackgrounds();
        lastWindowWidth = windowWidth;
    }
});

// document.write('<scr'+'ipt src="/file/web-dev/jquery.bxslider.min.js"></scr'+'ipt>');

// Case insensitive version of ':contains()'
jQuery.expr[':'].Contains = function(a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0
};

/*
if ($(".BBFormTable.DonationFormTable").length > 0) {
      /*
          1. Get Number of Rows under tbody. variable: standardDonation
          2. Get Width of Donation Form. variable: standardDonationWidth
          3. Subtract 1 from Number of Rows under tbody (Other amount row). variable: standardDonationAmounts
          4. Get Gap amount total in pixels. Subtract 1 from standardDonationAmounts and multiple that number by 10. variable: standardDonationGaps
          5. Subtract standardDonationGaps from standardDonationWidth to find amount of width each Amount can be. variable: standardDonationWidthMinusGaps
          6. Divide Width of Donation Form by Number of Amounts.
          7. Maintain 10px gap between inputs.
      * /
      var standardDonation = document.querySelectorAll("table[id*='_tblAmount'] > tbody > tr"),
          standardDonationWidth = $(".DonationFormTable_DonationPanel").width(),
          standardDonationAmounts = standardDonation.length - 1,
          standardDonationGaps = (standardDonationAmounts - 1) * 10,
          standardDonationWidthMinusGaps = standardDonationWidth - standardDonationGaps,
          standardDonationAmountWidth = standardDonationWidthMinusGaps / standardDonationAmounts,
          standardDonationWidthFirstAmt = $("table[id*='_tblAmount'] > tbody > tr:first-child").width();

      // $( "table[id*='_tblAmount'] > tbody > tr:not(:last-child)" ).each(function( index ) {
      //         $(this).width(standardDonationAmountWidth);
      // });

      // setTimeout(function() { 
          $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:first-child" ).width(standardDonationWidthFirstAmt);
          $( "table[id*='_tblAmount'] > tbody > tr:last-child > td:last-child" ).width(standardDonationWidthFirstAmt * 2 + 10);
      // }, 1000); 

} */

$("#fundSelect").on("change", function(e) {
    BBI.Methods.addFund($(this));
});

$("#donation-form input#pledgeAmount").on("keyup", function(e) {
    e.preventDefault();
    var val = this.value;
    if (isNaN(val)) {
        val = val.replace(/[^0-9\.]/g, '');
        if (val.split('.').length > 2) {
            val = val.replace(/\.+$/, "");
        }

        this.value = numberWithCommas(val);
    }                        
});

$("#donation-form input#pledgeId").on("keyup", function(e) {
    e.preventDefault();
    var val = this.value;
    if (isNaN(val)) {
        val = val.replace(/[^0-9]/g, '');
    }                        
});

// Day of Giving - functions
function updateAmount(field, fieldId) {
    var amountField = document.getElementById(fieldId);

    var val = field.value;
    if (isNaN(val)) {
        val = val.replace(/[^0-9\.]/g, '');
        if (val.split('.').length > 2) {
            val = val.replace(/\.+$/, "");
        }        
    }

    var numVal = parseFloat(val).toFixed(2);
    field.value = numberWithCommas(val);
    amountField.value = (isNaN(numVal) ? "0.00" : numVal);

    BBI.Methods.updateAmountValues();
}

function updateCartAmount(field) {
    var amountField = field.parentNode.parentNode.parentNode.getElementsByClassName("fund-amount")[0].firstChild;

    var val = field.value;
    if (isNaN(val)) {
        val = val.replace(/[^0-9\.]/g, '');
        if (val.split('.').length > 2) {
            val = val.replace(/\.+$/, "");
        }        
    }

    var numVal = parseFloat(val).toFixed(2);
    field.value = numberWithCommas(val);
    amountField.value = (isNaN(numVal) ? "0.00" : numVal);

    BBI.Methods.updateAmountValues();
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts[1] != undefined) {
        if (parts[1].length > 2) {
            parts[1] = parts[1].substring(0, 2);
        }
    }
    return parts.join(".");
}
// END: Day of Giving - functions

// Make it safe to use console.log always
window.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
        arguments.callee = arguments.callee.caller;
        var a = [].slice.call(arguments);
        (typeof console.log === "object" ? log.apply.call(console.log, console, a) : console.log.apply(console, a))
    }
};
(function(b) {
    function c() {}
    for (var d = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","), a; a = d.pop();) {
        b[a] = b[a] || c
    }
})((function() {
    try {
        console.log();
        return window.console;
    } catch (err) {
        return window.console = {};
    }
})());
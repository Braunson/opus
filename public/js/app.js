var App = {
    init: function(params = null) {
        this.params = params;
        this.bindUI();
        this.initJcrop();
        this.initCarousel();
        this.initTooltip();
        this.initCKEditor();
        this.getTeamMembers();
        this.setCategoryItemBgColor();

        $('#permissions-select').val($('#permissions-select').data('val'));
        $('#permissions-select').select2();

        $("#group-member-select").select2({
            ajax: {
                url: "/api/team/members/filter",
                type: 'POST',
                dataType: 'json',
                delay: 250,
                data: function (params) {
                    return {
                        q: params.term,
                    };
                },
                processResults: function (data, params) {
                    return {
                        results: data
                    };
                },
                cache: true
            },
            escapeMarkup: function (markup) { return markup; },
            minimumInputLength: 1,
            templateResult: formatMember,
            templateSelection: formatMemberSelection,
        });
        function formatMember(member) {
            if (member.loading) return member.text;

            var markup = `
                <div class="media">
                    <a class="pull-left" href="#">
                        <img class="media-object" src="/img/no-image.png" alt="Image" width="28" height="28" style="border-radius: 3px;">
                    </a>
                    <div class="media-body">
                        <p style="font-family: 'lato';"><span style="margin-right: 4px; font-weight: 700;">`+member.slug+`</span> `+member.first_name + ' ' + member.last_name +`</p>
                    </div>
                </div>
            `;

            return markup;
        }

        function formatMemberSelection(member) {
            if (member.selected === true) {
                return member.text;
            }
            return member.first_name + ' ' + member.last_name;
        }

        var fixAffixWidth = function() {
            $('[data-spy="affix"]').each(function() {
                $(this).width( $(this).parent().width() );
            });
        }
        fixAffixWidth();
        $(window).resize(fixAffixWidth);
    },
    setCategoryItemBgColor() {
        $('#categories-list #categories-list-item, .wikis-list-item').each(function(index, el) {
            let categoryName = $(el).data('name');
            let colorHash = new ColorHash();
            $(el).find('.cateogry-icon, .item-category-label').css({
                'background-color': colorHash.hex(categoryName),
                'color': '#ffffff',
            });
        });
    },
    initCKEditor() {
        if($('#wiki-description').length) {

            CKEDITOR.replace('wiki-description', {
                width: "100%",
                contentsCss: "/css/ckeditor-custom.css" ,
                height: $('#wiki-description').data('height'),
                enableTabKeyTools: true,
                removePlugins: 'elementspath',
                extraPlugins: 'codesnippet',
                codeSnippet_theme: 'github',
                resize_enabled: false,
                uiColor: '#eeeeee',
                toolbar: [
                    { name: 'justify3', items: ['Format'] },
                    { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Bold', 'Italic', 'Underline', 'Strike'] },
                    { name: 'colors', items: ['TextColor', 'BGColor', 'RemoveFormat', 'SelectAll', '-', 'NumberedList', 'BulletedList'] },
                    { name: 'justify', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                    { name: 'insert', items: ['Table', 'HorizontalRule', 'PageBreak', '-', 'Link', 'Iframe'] },
                    { name: 'editing', items: ['SpellCheck', '-', 'Find', 'Replace', ] },
                    { name: 'paragraph', items: ['-', 'Outdent', 'Indent'] },
                    { name: 'justify2', items: ['CodeSnippet', 'Source', 'Maximize', '-', 'Undo', 'Redo'] },
                ]
            });
        }
    },
    initTooltip() {
        $('[data-toggle="tooltip"]').tooltip({
            container: 'body'
        });
    },
    getTeamMembers() {
        let that = this;
        $.getJSON("/api/team/members", function(data) {
            var members = [];
            $.each(data, function(index, val) {
                 members.push({
                    'id'            :  val.id,
                    'name'          :  val.slug,
                    'full_name'     :  val.first_name + ' ' + val.last_name,
                    'profile_image' :  val.profile_image === null ? '/img/no-image.png' : '/img/avatars/' + val.profile_image,
                })
            });
            that.members = members;
            that.intiCommentMention();
        });
    },
    intiCommentMention() {
        var that = this;
        var emojis = [
            "smile", "+1", "-1", "100", "heart", "girl", "smiley", "kiss", "copyright", "iphone", "coffee",
            "a", "ab", "airplane", "alien", "ambulance", "angel", "anger", "angry",
            "arrow_forward", "arrow_left", "arrow_lower_left", "arrow_lower_right",
            "arrow_right", "arrow_up", "arrow_upper_left", "arrow_upper_right",
            "art", "astonished", "atm", "b", "baby", "baby_chick", "baby_symbol",
            "balloon", "bamboo", "bank", "barber", "baseball", "basketball", "bath",
            "bear", "beer", "beers", "beginner", "bell", "bento", "bike", "bikini",
            "bird", "birthday", "black_square", "blue_car", "blue_heart", "blush",
            "boar", "boat", "bomb", "book", "boot", "bouquet", "bow", "bowtie",
            "boy", "bread", "briefcase", "broken_heart", "bug", "bulb",
            "person_with_blond_hair", "phone", "pig", "pill", "pisces",
            "point_down", "point_left", "point_right", "point_up", "point_up_2",
            "police_car", "poop", "post_office", "postbox", "pray", "princess",
            "punch", "purple_heart", "question", "rabbit", "racehorse", "radio",
            "up", "us", "v", "vhs", "vibration_mode", "virgo", "vs", "walking",
            "warning", "watermelon", "wave", "wc", "wedding", "whale", "wheelchair",
            "white_square", "wind_chime", "wink", "wink2", "wolf", "woman",
            "womans_hat", "womens", "x", "yellow_heart", "zap", "zzz", 
        ];

        var emojis = $.map(emojis, function(value, i) {return {key: value, name:value}});

        $('#comment-input-textarea').atwho({
            at: "@",
            data: that.members,
            insertTpl: '@${name}',
            displayTpl: "<li><img src='${profile_image}' width='20' height='20' /> ${name}</li>",
            limit: 200,
        }).atwho({
            at: ":",
            data: emojis,
            insertTpl: ':${key}:',
            displayTpl: "<li><img src='/img/emojis/${key}.png' /> ${name}</li>",
            delay: 400,
        });
    },
    initCarousel() {
        if ($(document).find('.Carousel').length) {
            var $carousel = $('.Carousel');
            $carousel.wrapInner($('<div class="CarouselGroup"/>'));
            var $group = $('.CarouselGroup');
            var $group2 = $group.clone().appendTo($carousel);

            var animate = function() {
              $group.css({marginLeft: 0}).animate({marginLeft: -$group.width()}, 70000, 'linear').promise().done(function() {
                animate();
              });
            };

            animate();
        }
    },
    initJcrop: function() {
        var that = this;
        $('#cropimage').Jcrop({
            onSelect: that.updateCropCoords,
            bgColor: 'black',
            bgOpacity: .6,
            boxWidth: 300,
            boxHeight: 300,
            aspectRatio: 1,
            setSelect: [160, 160, 160, 160],
        });
    },
    updateCropCoords: function(c) {
        $('#x').val(c.x);
        $('#y').val(c.y);
        $('#w').val(c.w);
        $('#h').val(c.h);
    },
    likeSubject(subject, subjectType, element) {
        var that = this;
        $.ajax({
            url: '/api/like',
            type: 'POST',
            dataType: 'json',
            data: {
                subject,
                subjectType
            },
            success(data) {
                $(element).find('#spinner').hide();
                $(element).find('#like-page, #like-wiki').show();
                if(data.like === true) {
                    $(element).find('img[data-toggle="tooltip"], i[data-toggle="tooltip"]').attr('title', 'Unlike').tooltip('fixTitle');
                    $(element).find('#likes-counter').text(parseInt($(element).find('#likes-counter').text())+1);
                }  else {
                    $(element).find('img[data-toggle="tooltip"], i[data-toggle="tooltip"]').attr('title', 'Like').tooltip('fixTitle');
                    $(element).find('#likes-counter').text(parseInt($(element).find('#likes-counter').text())-1);
                }
            }
        });
    },
    deleteComment(commentId, element) {
        $.ajax({
            url: '/api/comment',
            type: 'POST',
            dataType: 'json',
            data: {
                _method: 'delete',
                commentId: commentId
            },
            success: function(data) {
                if(data.deleted === true) {
                    $('#total-subject-comments').text(parseInt($('#total-subject-comments').text())-1);
                    $(element).closest('.comment').animate({
                        'opacity' : '0.5'
                    }, 100).slideUp(100, function() {
                        $(element).closest('.comment').remove();
                    });
                }
            },
            error: function(error) {
                console.log(error);
            }
        });      
    },
    likeComment(comment, element) {
        var that = this;
        $.ajax({
            url: '/api/like',
            type: 'POST',
            dataType: 'json',
            data: {
                subject : comment,
                subjectType : 'comment'
            },
            success(data) {
                $(element).closest('li').find('#spinner').hide();
                $(element).show();
                if(data.like === true) {
                    $(element).text('Unlike');
                    $(element).closest('li').find('#comment-like-counter').text(parseInt($(element).closest('li').find('#comment-like-counter').text())+1);
                }  else {
                    $(element).text('Like');
                    $(element).closest('li').find('#comment-like-counter').text(parseInt($(element).closest('li').find('#comment-like-counter').text())-1);
                }
            }
        });
    },
    updateComment(commentId, comment, element) {
        var that = this;
        $.ajax({
            url: '/api/comment',
            type: 'POST',
            dataType: 'json',
            data: {
                _method: 'patch',
                commentId,
                comment
            },
            success(data) {
                toastr.success('Comment successfully updated');
                $(element).closest('.comment').find('.comment-content').data('comment-content', data.encodedComment);
                $(element).closest('.comment').find('.comment-content').empty().append(data.decodedComment);
                $(element).closest('.comment').find('#close-comment-update').trigger('click');
            },
            error(error) {
                var errors = JSON.parse(error.responseText);
                if(errors.comment) {
                    toastr.error(errors.comment[0]);
                }
            }
        });  
    },
    readURL(input) {
        var that = this;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                $('#team-logo-crop').attr('src', e.target.result);
                $('#team-logo-modal').modal('show');
                $('.crop').Jcrop({
                    onSelect: that.updateCoords,
                    bgColor: 'black',
                    bgOpacity: .6,
                    boxWidth: 300,
                    boxHeight: 300,
                    aspectRatio: 1,
                    setSelect: [160, 160, 160, 160],
                });
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    },
    updateCoords(c) {
        $('#avatar-upload-form').find('#x').val(c.x);
        $('#avatar-upload-form').find('#y').val(c.y);
        $('#avatar-upload-form').find('#w').val(c.w);
        $('#avatar-upload-form').find('#h').val(c.h);
    },
    bindUI: function () {
        var that = this;

        $("#team_logo, #profile_image").change(function(){
            that.readURL(this);
        });

        $('#team-logo-modal').on('hidden.bs.modal', function () {
            JcropAPI = $('#team-logo-crop').data('Jcrop');
            JcropAPI.destroy();
        });

        $(document).on('click', '#like-comment', function(e) {
            e.preventDefault();
            let comment = $(this).data('comment-id');

            $(this).hide();
            $(this).closest('li').find('#spinner').css('display', 'inline-block');

            that.likeComment(comment, this);
        });

        $(document).on('click', '#close-comment-update', function(e) {
            e.preventDefault();
            $(this).closest('.comment').find('.comment-body-inner').show();
            $(this).closest('.comment').find('.comment-body-con').find('#update-comment-form').remove();
        });

        $(document).on('click', '#update-comment-btn', function(e) {
            e.preventDefault();

            let commentId = $(this).closest('#update-comment-form').find('#comment-input-textarea').data('comment-id');
            let oldComment = $(this).closest('.comment').find('.comment-content').data('comment-content');
            let comment = $(this).closest('#update-comment-form').find('#comment-input-textarea').val();
            
            if(oldComment == comment) {
                return $(this).closest('.comment').find('#close-comment-update').trigger('click');
            }

            that.updateComment(commentId, comment, this);
        });

        $(document).on('click', '#edit-comment', function(e) {
            e.preventDefault();
            let comment = $(this).closest('.comment').find('.comment-content').data('comment-content');
            let commentId = $(this).closest('.comment').data('comment-id');

            var form = `
                <form action="#" id="update-comment-form" style="margin-top: 10px;">    
                    <div class="form-group" style="margin-bottom: 10px;">
                        <textarea name="comment" class="form-control" id="comment-input-textarea" data-comment-id="`+commentId+`" placeholder="Write a comment" style="height: 80px; resize: none;">`+comment+`</textarea>
                    </div>
                    <a href="#" class="btn btn-default btn-sm" id="close-comment-update">Cancel</a>
                    <a href="#" class="btn btn-success btn-sm" id="update-comment-btn">Save Changes</a>
                </form>
            `;

            $(this).closest('.comment').find('.comment-body-inner').hide();
            $(this).closest('.comment').find('.comment-body-con').append(form);

            that.intiCommentMention();
        });

        $(document).on('click', '#delete-comment', function(e) {
            e.preventDefault();
            if(confirm('Are you sure?')) {
                event.preventDefault();
                var commentId = $(this).data('comment-id');
                that.deleteComment(commentId, this);
            }
        });      

        $(document).on('click', '#like-wiki', function(e) {
            e.preventDefault();
            let wiki = $(this).data('wiki');
            $(this).hide();
            $(this).closest('.wiki-like-con').find('#spinner').css('display', 'inline-block');
            that.likeSubject(wiki, 'wiki', '.wiki-like-con');
        });

        $(document).on('click', '#like-page', function(e) {
            e.preventDefault();
            let page = $(this).data('page');
            $(this).hide();
            $(this).closest('.page-like-con').find('#spinner').css('display', 'inline-block');
            that.likeSubject(page, 'page', '.page-like-con');
        });

        $(".comments").scrollTop($('.comments').height()+120000000);

        if(document.getElementById('timezone')) {
            if($('#timezone').data('selected').length) {
                $('#timezone').val($('#timezone').data('selected'));
            } else {
                $('#timezone').val(Intl.DateTimeFormat().resolvedOptions().timeZone);
            }
        }

        $('#update-image-size').on('click', function(event) {
            event.preventDefault();
            $.ajax({
                url: '/organizations/'+Cookies.get('organization_slug')+'/users/avatar/crop',
                type: 'POST',
                dataType: 'json',
                data: {
                    'image' : $('#crop-image-form').find('#profile-image-name').val(),
                    'x'     : $('#crop-image-form').find('#x').val(),
                    'y'     : $('#crop-image-form').find('#y').val(),
                    'w'     : $('#crop-image-form').find('#w').val(),
                    'h'     : $('#crop-image-form').find('#h').val(),

                },
                success: function(data) {
                    $("#profile-pic-cropper").modal('hide');
                    window.location.reload();
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
        $('#profile_image[type="file"]').on('change', function() {
            var formData = new FormData($("#avatar-upload-form")[0]);
            $.ajax({
                url: '/organizations/'+Cookies.get('organization_slug')+'/users/avatar/store',
                type: 'POST',
                cache:false,
                processData: false,
                contentType: false,
                data: formData,
                success: function(data) {
                    console.log(data);
                    $("#profile-pic-cropper #cropimage").attr('src', '/images/profile-pics/' + data.image);
                    $("#profile-pic-cropper").modal('show');
                    $("#profile-pic-cropper").find('#profile-image-name').val(data.image);
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    },
};

$(document).ready(function() {
    App.init();
});

$(function() {
    if($('#wiki-page-tree').length > 0 ) {
        let wiki = $('#wiki-page-tree').data('wiki');

        $('#wiki-page-tree').jstree({
            core: {
                "check_callback" : true,
                "check_while_dragging": true,
                "animation" : 250,
                "themes" : {
                    'icons': false,
                    'dots' : false,
                    'responsive': true,
                    'variant': "large",
                },
                'data' : {
                    url: function (node) {
                        return '/api/wikis/pages';
                    },
                    type: 'POST',
                    data: function(node) {
                        // Open Tree to a node
                        if($('#page-open').length > 0) {
                            var page = $('#page-open').data('page');
                            $('#page-open').remove();
                            return {
                                'page' : page,
                                'wiki' : wiki,
                                'explore': true,   
                            }
                        }
                        
                        // Get root nodes
                        if(node.id === '#') {
                            return {
                                'wiki' : wiki,
                            }
                        }

                        // Get the child nodes of a page
                        return {
                            'page' : node.data.slug,
                        }
                    }
                }
            },
            plugins: [ "wholerow", "dnd" ]
        }).on("select_node.jstree", function (e, data) {
            document.location = data.node.a_attr.href;
        }).on("ready.jstree", function(e, data) {
            $('#wiki-page-tree').css('margin-left', '-7px');
            if(data.instance._cnt == 0) {
                var html = `<p class="text-center text-muted" style="position: relative; top: -3px; max-width: 175px; margin: auto; font-size: 13px;">No pages yet.</p>`;
                $('#wiki-page-tree').replaceWith(html);
            };

            data.instance._open_to($('#wiki-page-tree').data('page'));

            // Sorting Tree
            $("#wiki-page-tree>ul").each(function(){
                $(this).html($(this).children('li').sort(function(a, b){
                    return ($(b).data('position')) < ($(a).data('position')) ? 1 : -1;
                }));
            });

        }).on('move_node.jstree', function(e, data) {
            $.ajax({
                url: '/api/pages/reorder',
                type: 'POST',
                dataType: 'json',
                data: {
                    'nodeToChangeParent': data.node.id,
                    'parent': data.parent,
                    'position': data.position,
                },
                success: function() {
                    return true;
                },
                error: function(error) {
                    var response = JSON.parse(error.responseText);
                    console.log(response);
                }
            });
        });
    }
});
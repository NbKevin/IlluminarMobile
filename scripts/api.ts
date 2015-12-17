/**
 * Created by Nb on 9/12/2015.
 */

///<reference path="vendor/jquerymobile.d.ts"/>


declare var $:JQueryStatic;

/**
 * Partial definition of paths and hosts.
 */
module illuminar {
    export var HOST = "http://illuminar-estrellas.rhcloud.com";
}


/**
 * API module provides access to remote API on Lovely Lofter.
 */
module illuminar.api {
    /**
     * A filter.
     */
    export class Filter {
        public author:string;
        public tag:string;
        public title:string;
        private withSummary = true;

        constructor(author:string = null, tag:string = null, title:string = null) {
            this.author = author;
            this.tag = tag;
            this.title = title;
        }

        private validate() {
            if (this.author == null && this.tag == null && this.title == null) {
                throw new Error("At least one filter must be provided");
            }
        }

        /**
         * Convert the filter to form data.
         */
        public toFormData():FormData {
            this.validate();
            var formData = new FormData();
            if (this.author) formData.append("author", this.author);
            if (this.tag) formData.append("tag", this.tag);
            if (this.title) formData.append("title", this.title);
            formData.append("summary", this.withSummary);
            return formData;
        }

        public serialise():Object {
            this.validate();
            var object = {};
            if (this.author) object.author = this.author;
            if (this.tag) object.tag = this.tag;
            if (this.title) object.title = this.title;
            object.summary = this.withSummary;
            return object;
        }
    }

    export var REQUEST_URL = "/api/";

    /**
     * Search for lofter posts matching the given filter.
     * @param filter Filter.
     * @param onResponse On response callback.
     */
    export function search(filter:Filter, onResponse:Function) {
        $.post(
            HOST + REQUEST_URL + '/cyan/lofter/search/',
            filter.serialise(),
            (response:Object) => {
                onResponse(response)
            },
            'json'
        )
    }

    export function fetchPost(uuid:string) {
        $.getJSON(
            HOST + REQUEST_URL + '/cyan/lofter/archive/' + uuid + '/',
            (response) => {
                // console.log(response);
                $('#post-title').text(response.archive.title == '' ? 'Untitled' : response.archive.title);
                $('#post-content').html(response.archive.content.replace(/\n\r/g, '<br><br>')
                    .replace(/\r\n/g, '<br><br>').replace(/\n/g, '<br/><br/>').replace(/\r/g, '<br><br>'));
                $('#view-on-lofter-bottom').attr('onclick', 'window.open(\"' + response.archive.origin + '\", \"_blank\");');
                $('title').text(response.archive.title == '' ? 'Untitled' : response.archive.title);
            }
        )
        $('#post-content').text('');
        location.href = '#post';
        $('#post-title').text('Fetching post...')
    }
}


function fireSearch() {
    var author = $('#author').val();
    var tag = $('#tag').val();
    var title = $('#title').val();

    var filter = new illuminar.api.Filter(author, tag, title);
    illuminar.api.search(filter,
        (response) => {
            console.log(response);
            for (var i = 0; i < response.result.length; i++) {
                var post = response.result[i];
                console.log(post);
                var li = $('<li>').attr({
                    onclick: 'illuminar.api.fetchPost(\"' + post.uid + '\");',
                    cursor: 'pointer'
                });
                var a = $('<a>');
                a.attr({'data-transition': 'slide'});
                a.append($('<h2>').text(post.title == '' ? 'Untitled' : post.title));
                a.append($('<p>').html(post.summary.replace(/\n/g, '<br>') + '...'));
                a.appendTo(li);
                li.appendTo($('#result-list'));
            }
            $('#result-list').listview('refresh');
            $('#search-header').text('Search result: ' + String(response.result.length) + ' posts');
            $('title').text('Search result: ' + String(response.result.length) + ' posts');
        }
    );
    $('#search-header').text('Searching...').enhanceWithin();
    $('#result-list').empty();

    location.href = '#result';
}

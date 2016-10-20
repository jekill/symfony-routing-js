import {Router} from "./router";
const assert = require("chai").assert;

describe('Test Router', () => {
    it("Should generate a path", function () {

        const router = new Router({base_url: ''}, {
            literal: {
                tokens: [['text', '/homepage']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/homepage', router.generate('literal'));

    });


    it('Should generate a path with params', function () {
        const router = new Router({base_url: ''}, {
            blog_post: {
                tokens: [['variable', '/', '[^/]+?', 'slug'], ['text', '/blog-post']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/blog-post/foo', router.generate('blog_post', {slug: 'foo'}));
    });


    it('Should generate a path with base_url', function () {
        const router = new Router({base_url: '/foo'}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/foo/bar', router.generate('homepage'));
    });


    it('Should generate url with scheme', function () {
        const router = new Router({base_url: '/foo', host: "localhost"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {"_scheme": "https"},
                hosttokens: []
            }
        });

        assert.equal('https://localhost/foo/bar', router.generate('homepage'));
    });

    it('Should generate url with host', function () {


        const router = new Router({base_url: '/foo', host: "localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {},
                hosttokens: [['text', 'otherhost']]
            }
        });

        assert.equal('http://otherhost/foo/bar', router.generate('homepage'));
    });

    it('Should generate url with host when the same scheme requirement given', function () {
        const router = new Router({base_url: '/foo', host: "localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {"_scheme": "http"},
                hosttokens: [['text', 'otherhost']]
            }
        });

        assert.equal('http://otherhost/foo/bar', router.generate('homepage'));
    });

    it('Should generate an url with host when another scheme requirement given', function () {
        const router = new Router({base_url: '/foo', host: "localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {"_scheme": "https"},
                hosttokens: [['text', 'otherhost']]
            }
        });

        assert.equal('https://otherhost/foo/bar', router.generate('homepage'));
    });

    it('Should generate an url with host placeholders', function () {
        const router = new Router({base_url: '/foo', host: "localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {},
                hosttokens: [
                    ['text', '.localhost'],
                    ['variable', '', '', 'subdomain']
                ]
            }
        });

        assert.equal('http://api.localhost/foo/bar', router.generate('homepage', {subdomain: 'api'}));
    });


    it('Should generate an url with host placeholders and defaults', function () {
        const router = new Router({base_url: '/foo', host: "localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {subdomain: 'api'},
                requirements: {},
                hosttokens: [
                    ['text', '.localhost'],
                    ['variable', '', '', 'subdomain']
                ]
            }
        });

        assert.equal('http://api.localhost/foo/bar', router.generate('homepage'));
    });


    it('Should generate a relative path when the same host given', function () {
        const router = new Router({base_url: '/foo', host: "api.localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {},
                hosttokens: [
                    ['text', '.localhost'],
                    ['variable', '', '', 'subdomain']
                ]
            }
        });

        assert.equal('/foo/bar', router.generate('homepage', {subdomain: 'api'}));
    });

    it('Should generate an url using an absolute url', function () {
        const router = new Router({base_url: '/foo', host: "localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('http://localhost/foo/bar', router.generate('homepage', {}, true));
    });

    it('Should generate an url using absolute url when scheme requirement given', function () {
        const router = new Router({base_url: '/foo', host: "localhost", scheme: "http"}, {
            homepage: {
                tokens: [['text', '/bar']],
                defaults: {},
                requirements: {"_scheme": "http"},
                hosttokens: []
            }
        });

        assert.equal('http://localhost/foo/bar', router.generate('homepage', {}, true));
    });

    it('Should generate a path with optional trailing param', function () {
        const router = new Router({base_url: ''}, {
            posts: {
                tokens: [['variable', '.', '', '_format'], ['text', '/posts']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/posts', router.generate('posts'));
        assert.equal('/posts.json', router.generate('posts', {'_format': 'json'}));
    });

    it('Should generate a path with query string without defaults', function () {
        const router = new Router({base_url: ''}, {
            posts: {
                tokens: [['variable', '/', '[1-9]+[0-9]*', 'page'], ['text', '/blog-posts']],
                defaults: {'page': 1},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/blog-posts?extra=1', router.generate('posts', {page: 1, extra: 1}));
    });

    it("Should allow slashes", function () {
        const router = new Router({base_url: ''}, {
            posts: {
                tokens: [['variable', '/', '.+', 'id'], ['text', '/blog-post']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/blog-post/foo/bar', router.generate('posts', {id: 'foo/bar'}));
    });

    it('Should generate a path with extra params', function () {
        const router = new Router(undefined, {
            foo: {
                tokens: [['variable', '/', '', 'bar']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/baz?foo=bar', router.generate('foo', {
            bar: 'baz',
            foo: 'bar'
        }));
    });

    it('Should generate a path with extra params deep', function () {
        const router = new Router(undefined, {
            foo: {
                tokens: [['variable', '/', '', 'bar']],
                defaults: {},
                requirements: {},
                hosttokens: []
            }
        });

        assert.equal('/baz?foo%5B%5D=1&foo%5B1%5D%5B%5D=1&foo%5B1%5D%5B%5D=2&foo%5B1%5D%5B%5D=3&foo%5B1%5D%5B%5D=foo&foo%5B%5D=3&foo%5B%5D=4&foo%5B%5D=bar&foo%5B5%5D%5B%5D=1&foo%5B5%5D%5B%5D=2&foo%5B5%5D%5B%5D=3&foo%5B5%5D%5B%5D=baz&baz%5Bfoo%5D=bar+foo&baz%5Bbar%5D=baz&bob=cat',
            router.generate('foo', {
                bar: 'baz', // valid param, not included in the query string
                foo: [1, [1, 2, 3, 'foo'], 3, 4, 'bar', [1, 2, 3, 'baz']],
                baz: {
                    foo: 'bar foo',
                    bar: 'baz'
                },
                bob: 'cat'
            }));
    });

    it("Should throw an error when required parameter wasn't given", function () {
        const router = new Router({base_url: ''}, {
            foo: {
                tokens: [['text', '/moo'], ['variable', '/', '', 'bar']],
                defaults: {},
                requirements: {}
            }
        });

        try {
            router.generate('foo');
            assert.fail('generate() was expected to throw an error, but has not.');
        } catch (e) {
            assert.equal('The route "foo" requires the parameter "bar".', e.message);
        }
    });

    it("Should throw an error for non existent route",function () {
        const router = new Router({base_url: ''}, {});

        try {
            router.generate('foo');
            assert.fail('generate() was expected to throw an error, but has not.');
        } catch (e) {
        }
    });

    //
    // function testGetBaseUrl() {
    //     const router = new Router({base_url: '/foo'}, {
    //         homepage: {
    //             tokens: [['text', '/bar']],
    //             defaults: {},
    //             requirements: {}
    //         }
    //     });
    //
    //     assert.equal('/foo', router.baseUrl);
    // }
    //
    // function testGeti18n() {
    //     const router = new Router({base_url: '/foo', prefix: 'en__RG__'}, {
    //         en__RG__homepage: {
    //             tokens: [['text', '/bar']],
    //             defaults: {},
    //             requirements: {},
    //             hosttokens: []
    //         },
    //         es__RG__homepage: {
    //             tokens: [['text', '/es/bar']],
    //             defaults: {},
    //             requirements: {},
    //             hosttokens: []
    //         },
    //         _admin: {
    //             tokens: [['text', '/admin']],
    //             defaults: {},
    //             requirements: {},
    //             hosttokens: []
    //         }
    //     });
    //
    //     assert.equal('/foo/bar', router.generate('homepage'));
    //     assert.equal('/foo/admin', router.generate('_admin'));
    //
    //     router.prefix = 'es__RG__';
    //     assert.equal('/foo/es/bar', router.generate('homepage'));
    // }
    //
    // function testGetRoute() {
    //     const router = new Router({base_url: ''}, {
    //         blog_post: {
    //             tokens: [['variable', '/', '[^/]+?', 'slug'], ['text', '/blog-post']],
    //             defaults: {},
    //             requirements: {"_scheme": "http"}
    //         }
    //     });
    //
    //     var expected = {
    //         'defaults': {},
    //         'tokens': [
    //             ['variable', '/', '[^/]+?', 'slug'],
    //             ['text', '/blog-post']
    //         ],
    //         'requirements': {"_scheme": "http"}
    //     };
    //
    //     assert.equal(expected, router.getRoute('blog_post'));
    // }
    //
    // function testGetRoutes() {
    //     const router = new Router({base_url: ''}, {
    //         blog_post: 'test',
    //         blog: 'test'
    //     });
    //
    //     var expected = new Map(<any>{
    //         blog_post: 'test',
    //         blog: 'test'
    //     });
    //
    //     assert.equal(expected, router.routes);
    // }
    //
    // function testGenerateWithNullValue() {
    //     const router = new Router({base_url: ''}, {
    //         posts: {
    //             tokens: [
    //                 ['variable', '/', '.+', 'id'],
    //                 ['variable', '/', '.+', 'page'],
    //                 ['text', '/blog-post']
    //             ],
    //             defaults: {},
    //             requirements: {},
    //             hosttokens: []
    //         }
    //     });
    //
    //     assert.equal('/blog-post//10', router.generate('posts', {page: null, id: 10}));
    // }


});
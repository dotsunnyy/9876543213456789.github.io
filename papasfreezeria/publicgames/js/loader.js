const supportDecoderApi = "DecompressionStream"in self
  , isSWC = e=>67 === e[0] && 87 === e[1] && 83 === e[2]
  , outputSize = e=>new DataView(e.buffer).getUint32(4, !0);
function Decoder(e, t=8) {
    if (!supportDecoderApi)
        throw "Your browser not support DecompressionStream =(";
    const r = new self.DecompressionStream("deflate")
      , n = r.writable.getWriter()
      , i = r.readable.getReader()
      , o = new Uint8Array(e);
    let s, a = !1, l = !1;
    function c() {
        i.read().then((function r(n) {
            const a = n.done
              , c = n.value;
            return c && (o.set(c, t),
            t += c.length),
            a || t >= e ? (l = !0,
            s && s(),
            void console.debug("[Loader] Decoder closed:", t)) : i.read().then(r)
        }
        ))
    }
    return {
        get buffer() {
            return o
        },
        write(e) {
            n.ready.then((()=>{
                n.write(e),
                a || (a = !0,
                c())
            }
            ))
        },
        readAll: ()=>l ? Promise.resolve(o) : new Promise((e=>{
            s = ()=>{
                e(o)
            }
        }
        ))
    }
}
function Fetcher(e="", t=(e=>e)) {
    let r, n = 0, i = [];
    return t && t(0),
    fetch(e).then((e=>(n = +e.headers.get("Content-Length"),
    r = e.body.getReader(),
    r.read()))).then((e=>{
        const o = e.value;
        console.debug("[Loader] Header:", String.fromCharCode.apply(null, o.slice(0, 3).reverse()));
        let s, a = 0;
        if (supportDecoderApi && (67 === (l = o)[0] && 87 === l[1] && 83 === l[2])) {
            const e = outputSize(o)
              , t = o.slice(0, 8);
            t[0] = 70,
            console.debug("[Loader] SWC size:", outputSize(o)),
            s = Decoder(e, 8),
            s.buffer.set(t),
            s.write(o.slice(8))
        } else
            i.push(o);
        var l;
        return a += o.length,
        t && t(Math.min(1, a / n)),
        r.read().then((function e(o) {
            if (o.done) {
                if (s)
                    return s.readAll();
                {
                    let e = new Uint8Array(a)
                      , t = 0;
                    return i.forEach((r=>{
                        e.set(r, t),
                        t += r.length
                    }
                    )),
                    e
                }
            }
            const l = o.value;
            return a += l.length,
            t && t(Math.min(1, a / n)),
            s ? s.write(l) : i.push(l),
            r.read().then(e)
        }
        ))
    }
    ))
}
var Loader = function() {
    function e(e, r=(e=>e)) {
        const n = e.path.indexOf(".js") > -1;
        if (!n && supportDecoderApi)
            return Fetcher(e.path, r).then((t=>({
                meta: e.meta || {},
                name: e.name,
                path: e.path,
                resourceType: e.resourceType,
                data: t.buffer,
                type: "swf"
            })));
        const i = new XMLHttpRequest;
        return i.addEventListener("progress", (t=>{
            const n = "gzip" === i.getAllResponseHeaders("content-encoding")
              , o = t.total || +i.getAllResponseHeaders("content-length") || e.size * (n ? .25 : 1);
            r(o ? Math.min(1, t.loaded / o) : 1)
        }
        )),
        i.open("GET", e.path, !0),
        i.responseType = n ? "text" : "arraybuffer",
        new Promise(((o,s)=>{
            i.addEventListener("error", s),
            i.addEventListener("load", (()=>{
                if (r(1),
                n) {
                    const e = new Blob([i.response],{
                        type: "text/javascript"
                    });
                    t(URL.createObjectURL(e)).then((()=>o(void 0)))
                } else
                    o({
                        meta: e.meta || {},
                        name: e.name,
                        path: e.path,
                        resourceType: e.resourceType,
                        data: i.response,
                        type: n ? "js" : "swf"
                    })
            }
            )),
            i.send()
        }
        ))
    }
    function t(e, t) {
        const r = document.querySelector("head")
          , n = document.createElement("script");
        return new Promise(((i,o)=>{
            Object.assign(n, {
                type: "text/javascript",
                async: !0,
                src: e.path || e,
                onload: ()=>{
                    t && t(1),
                    i(n)
                }
                ,
                onerror: o,
                onreadystatechange: e=>{
                    n.readyState
                }
            }),
            r.appendChild(n)
        }
        ))
    }
    function r(e, t, r) {
        const n = {
            callback: e,
            childs: t ? t.slice() : void 0,
            value: 0,
            weight: r || 1,
            get report() {
                return function(e) {
                    if (this.childs) {
                        let e = 0
                          , t = 0;
                        this.childs.forEach((r=>{
                            e += r.weight || 1,
                            t += r.value || 0
                        }
                        )),
                        this.value = t / e
                    } else
                        this.value = e * this.weight;
                    this.callback && this.callback(this.value)
                }
                .bind(this)
            }
        };
        return t && t.forEach((e=>{
            e.callback = n.report
        }
        )),
        n
    }
    let n, i, o, s, a;
    function l(e) {
        if (!e)
            throw new Error("Config is required");
        i = e;
        const t = document.querySelector("#splash__image")
          , r = document.querySelector("#progress__root")
          , l = document.querySelector("#progress__line");
        o = t,
        s = r;
        const c = e.progress;
        c.rect = c.rect || [0, .9, 1, .2],
        Object.assign(t.style, {
            backgroundImage: `url(${e.splash})`,
            visibility: "visible"
        }),
        Object.assign(r.style, {
            background: c.back,
            left: 100 * c.rect[0] + "%",
            top: 100 * c.rect[1] + "%",
            width: 100 * c.rect[2] + "%",
            height: 100 * c.rect[3] + "%"
        }),
        Object.assign(l.style, {
            background: c.line
        }),
        n = e=>{
            if ("tb" === c.direction)
                Object.assign(l.style, {
                    height: 100 * e + "%",
                    width: "100%"
                });
            else
                Object.assign(l.style, {
                    height: "100%",
                    width: 100 * e + "%"
                })
        }
        ,
        a = ()=>{
            let r = "string" == typeof e.x ? parseFloat(e.x.replace("%", "")) / 100 * window.innerWidth : e.x
              , n = "string" == typeof e.y ? parseFloat(e.y.replace("%", "")) / 100 * window.innerHeight : e.y
              , i = "string" == typeof e.w ? parseFloat(e.w.replace("%", "")) / 100 * window.innerWidth : e.w
              , o = "string" == typeof e.h ? parseFloat(e.h.replace("%", "")) / 100 * window.innerHeight : e.h;
            r || (r = 0),
            n || (n = 0),
            i || (i = window.innerWidth),
            o || (o = window.innerHeight);
            const s = Math.min(o / e.height, i / e.width)
              , a = Math.ceil(e.width * s)
              , l = Math.ceil(e.height * s)
              , c = r + (i - a) / 2
              , d = n + (o - l) / 2;
            Object.assign(t.style, {
                width: `${a}px`,
                height: `${l}px`,
                left: `${c}px`,
                top: `${d}px`
            })
        }
        ,
        window.addEventListener("resize", a),
        a()
    }
    return window.setStageDimensions = function(e, t, r, n) {
        i.x = e,
        i.y = t,
        i.w = r,
        i.h = n,
        window.AVMPlayerCoolmath && window.AVMPlayerCoolmath.setStageDimensions(e, t, r, n),
        a && a()
    }
    ,
    {
        init: l,
        runGame: function(c=(e=>e), d=(e=>e)) {
            i || l();
            let h = Array.isArray(i.runtime) ? h : [i.runtime];
            h = h.map((e=>({
                path: e.path || e,
                size: e.size || 0
            })));
            const p = i.binary
              , u = r(null, null, 4)
              , g = r((e=>{
                console.log("AVM Load", e)
            }
            ), null, i.progressParserWeigth ? i.progressParserWeigth : .001);
            r((function(e) {
                n(e),
                c(e)
            }
            ), [u, g]),
            function(n, i, o=(e=>e), s) {
                const a = n.length
                  , l = i.length
                  , c = n.concat(i)
                  , d = Array.from({
                    length: a + l
                }, (()=>r()));
                let h;
                return r(o, d),
                s ? (h = i.map(((t,r)=>e(t, d[r].report))),
                h = h.concat(n.map(((e,r)=>t(e, d[r + l].report))))) : h = c.map(((t,r)=>e(t, d[r].report))),
                Promise.all(h).then((e=>e.filter((e=>e && "swf" === e.type))))
            }(h, p, u.report, i.debug).then((e=>{
                const t = window.startCoolmathGame;
                if (!t)
                    throw "Could not find a 'startCoolmathGame' method";
                i.files = e,
                t(i)
            }
            )),
            Object.assign(window, {
                updateCoolmathProgressBar: g.report,
                coolmathGameParseComplete: e=>{
                    if (d(e),
                    i.start) {
                        Object.assign(s.style, {
                            visibility: "hidden",
                            opacity: 0
                        }),
                        Object.assign(o.style, {
                            backgroundImage: `url(${i.start})`
                        });
                        let t = r=>{
                            if (window.removeEventListener("click", t),
                            Object.assign(o.style, {
                                visibility: "hidden",
                                opacity: 0
                            }),
                            !e)
                                throw "CoolmathPlayer did not send a callback for starting game";
                            e(),
                            window.setTimeout((()=>{
                                window.removeEventListener("resize", a),
                                a = null
                            }
                            ), 500)
                        }
                        ;
                        window.addEventListener("click", t)
                    } else
                        Object.assign(o.style, {
                            visibility: "hidden",
                            opacity: 0
                        }),
                        window.setTimeout((()=>{
                            window.removeEventListener("resize", a),
                            a = null
                        }
                        ), 500)
                }
            })
        }
    }
}();

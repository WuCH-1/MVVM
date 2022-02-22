class Dep {
    constructor() {
        this.subs = []
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(wather => watcher.update())
    }
}

class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        this.oldValue = this.get()
    }
    get() {
        Dep.target = this
        let value = CompilerUtil.getVal(this.vm,this.expr)
        Dep.target = null
        return value
    }
    update() {
        let newVal = CompilerUtil.getVal(this.vm,this.expr)
        if (newVal !== this.oldValue) {
            this.cb(newVal)
        }
    }
}

// 数据劫持 实现数据的响应式
class Observer {
    constructor(data) {
        this.observer(data)        
    }
    observer(data) {
        if(data && typeof data == "object") {
            for (let key in data) {
                this.defindReactive(data, key, data[key])
            }
        }
    }
    defindReactive(obj, key, value) {
        this.observer(value)
        let dep = new Dep()
        Object.defineProperty(obj,key,{
            get() {
                Dep.target && dep.subs.push(Dep.target)
                return value
            },
            set:(newVal)=>{
                if(newVal != value) {
                    this.observer(newVal)
                    value = newVal
                    dep.notify()
                }
            }
        })
    }
}

class Vue {
    constructor(options) {
        this.$el = options.$el
        this.$data = options.$data
        if (this.$el) {
            new Observer(this.$data)
            // 使用vm来代理vm.$data
            this.proxyVm(this.$data)
            // 编译模板
            new Compiler(this.$el, this)
        }
    }
    proxyVm(data) {
        for (let key in data) {
            Object.defineProperty(this, key, {
                get() {
                    return data[key]
                }
            })
        }
    }
}
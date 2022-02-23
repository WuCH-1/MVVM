class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm
        this.expr = expr
        this.callback = cb
        this.value = this.get()
    }
    get(){
        Dep.target = this
        let value = this.getVal(this.vm,this.expr)
        Dep.target = null;
        return value
    }
    getVal(vm,expr){
        expr = expr.split('.')
        return expr.reduce((pre,next)=>{
            return pre[next]
        },vm.$data)
    }
    update(){
        let newValue = this.getVal(this.vm,this.expr)
        let oldValue = this.value
        if(newValue !== oldValue){
            this.callback(newValue)
        }
    }
}

class Dep{
    constructor(){
        //订阅的数组
        this.subs = [];
    }
    /**
     * 添加订阅
     * @param watcher
     */
    addSub(watcher){
        this.subs.push(watcher);
    }
    /**
     * 通知全体完成添加订阅，循环每一个watcher，调用watcher的update(),文本节点和表单全部重新赋值
     */
    notify(){
        this.subs.forEach(watcher => watcher.update());
    }
}
class Observer {
    constructor(data){
        this.observe(data)
    }
    /**
     * 将所有data数据改成set和get的形式
     * @param data
     */
    observe(data){
        if(!data || typeof data !== 'object'){
            return
        }
        Object.keys(data).forEach(key=>{
            this.defineReactive(data,key,data[key])
            this.observe(data[key])
        })
    }
    /**
     * 定义响应式，在赋新值的时候加点中间过程
     * @param obj 数据对象
     * @param key 数据对象属性
     * @param value 属性值
     */
    defineReactive(obj,key,value){
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue){
                if(newValue !== value){
                    //如果是新值是对象则继续劫持
                    that.observe(newValue)
                    value = newValue
                    dep.notify()
                }
            }
        })
    }
}
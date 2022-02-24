const CompileUtil = {
    /**
     * 获取实例上对应数据，返回 vm.$data.xxx.yyy
     * @param vm
     * @param expr
     * @returns {T}
     */
    getVal(vm,expr){
        expr = expr.split('.')
        return expr.reduce((pre,next)=>{
            return pre[next]
        },vm.$data)
    },
    getTextVal(vm,expr){
        return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            return this.getVal(vm,arguments[1].trim())
        })
    },
    updater:{
        textUpdater(node,value){
            node.textContent = value
        },
        modelUpdater(node,value){
            node.value = value;
        },
    },
    /**
     * 带v-model属性的元素节点编译
     * @param node
     * @param vm
     * @param expr
     */
    model(node,vm,expr){
        let updateFn = this.updater['modelUpdater']
        new Watcher(vm,expr,(newValue)=>{
            updateFn && updateFn(node,this.getVal(vm,expr));
        });
        updateFn && updateFn(node,this.getVal(vm,expr))
    },
    /**
     * 文本节点编译
     * @param node
     * @param vm
     * @param text
     */
    text(node,vm,text){
        let updateFn = this.updater['textUpdater']
        let value = this.getTextVal(vm,text)
        // let value = text.replace(/\{\{([^}]+)\}\}/g,(...argument)=>{
        //     return this.getVal(vm,arguments[1].trim())
        // })
        text.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
            new Watcher(vm,arguments[1].trim(),(newValue)=>{
                updateFn && updateFn(node, this.getTextVal(vm,newValue))
            })
        })
        updateFn && updateFn(node,value)
    }
}
class Compile {
    constructor(el,vm){
        this.el = this.isElementNode(el)?el:document.querySelector(el)
        this.vm = vm
        if(this.el) {
            // 1.真实DOM移入到内存中 fragment
            let fragmentAll = this.nodeToFragment(this.el)
            // 2.编译 => 提取想要的元素节点 v-model 和文本节点 {{}}
            this.compile(fragmentAll)
            // 3.把编译好的fragment再返回页面去
            this.el.appendChild(fragmentAll)
        }
    }
    //判断是否是元素节点
    isElementNode(node){
        return node.nodeType === 1;
    }
    //判断属性名字是不是包含'v-'
    isDirective(name){
        console.log(name)
        return name.includes('v-')
    }
    // 把节点移入fragment 后返回
    nodeToFragment(el){
        let fragment = document.createDocumentFragment()
        let firstChild
        while(firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment
    }

    compile(fragment){
        let childNodes = fragment.childNodes
        Array.from(childNodes).forEach(node=>{
            if(this.isElementNode(node)){
                this.compileElement(node)
                this.compile(node)
            }else{
                this.compileText(node)
            }
        })
    }
    compileElement(node){
        let attrs = node.attributes
        Array.from(attrs).forEach((attr)=>{
            let attrName = attr.name
            if(this.isDirective(attrName)) {
                let expr = attr.value
                let type = attrName.slice(2);
                CompileUtil[type](node,this.vm,expr);
            }
        })
    }
    compileText(node){
        let text = node.textContent
        let reg = /\{\{([^}]+)\}\}/g
        if (reg.test(text)){
            CompileUtil['text'](node,this.vm,text)
        }
    }
}
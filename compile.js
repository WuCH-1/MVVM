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
        return name.include('v-')
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
                let expr = attr.name
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

    CompileUtil(){
        
    }
}
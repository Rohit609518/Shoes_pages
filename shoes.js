

let box = document.querySelectorAll(".box2 li");

window.addEventListener('scroll',()=>{
    box.forEach(item=>{

       const cardTop = item.getBoundingClientRect().top;

        if (cardTop<window.innerHeight -100) {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0PX)'; 
        }
    })
})
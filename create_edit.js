const openCreatePlaneButton = document.getElementById('create_plane_open_button');
const create_plane_section = document.getElementById('create_plane');
const close_cross = document.getElementById('cross');

openCreatePlaneButton.addEventListener('click', ()=>{
    create_plane_section.classList.add('show');
})

close_cross.addEventListener('click', ()=>{
    create_plane_section.classList.remove('show');
})

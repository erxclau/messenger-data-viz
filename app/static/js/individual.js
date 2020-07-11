window.onload = async () => {
    let convo_id = window.location.pathname.substr(6)

    let data = await d3.json(`/data/${convo_id}`);
    document.title = data['name'];

    console.log(data)

}

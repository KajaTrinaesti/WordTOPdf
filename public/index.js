let submit =  document.getElementById('submit')
let selectedFile = document.getElementById('file')

let documentsConverted = 0;
let request = async () => {
    const response = await fetch('http://localhost:3000/api');
    const data = await response.json();
    documentsConverted = data.documentsConverted ? data.documentsConverted : '0';
    let docsConverted = document.getElementById('docsConverted');
    docsConverted.innerText = documentsConverted;

    console.log(documentsConverted)
}

request()


selectedFile.onchange =  () => {
    selectedFile = document.getElementById('file')

    checkFileType(selectedFile.files.item(0).type, selectedFile)

    document.getElementById('choosenFile').innerText = selectedFile.files.item(0).name
}


submit.onclick = (e) => {
    // console.log(e)
    // e.preventDefault()

    // fetch

    document.getElementById('form').classList.add('none')
    document.getElementById('poruka').classList.remove('none')


    let interval = setInterval(() => {
        fetch('http://localhost:3000/getFileLink')
            .then(data => {
                console.log(data)
                if(data.status === 200) {
                    clearInterval(interval)

                    request()

                    document.getElementById('download').classList.remove('disabled')
                    document.getElementById('download').classList.add('enabled')
                    document.getElementById('poruka').innerHTML = 'Your file is ready to download <a href=".">Convert again</a>'
                }
                if(data.status === 401) {
                    clearInterval(interval)
                    document.getElementById('poruka').innerHTML = '<span class="red">Something went wrong!</span> <a href=".">Try again</a>'
                    alert('Something went wrong. Please try again!')
                }
            }).catch(err => {

            })
    }, 2000)

    
}


function checkFileType(type, input) {
    if(type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        alert('Please select Word file!')
        input.value = ''
    }
}


function close() {
    document.querySelector('#after').addEventListener('load', function() {
        window.close();
    });
}

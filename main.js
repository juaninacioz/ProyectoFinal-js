//#region  CONEXION API
/**
Realize una petición HTTP GET utilizando la función fetch de JavaScript puro.
@param {string} urlBase - URL base a la que se va a realizar la petición HTTPS.
@param {Object} parametros - Parametros que se van a incluir en la URL como query parameters.
* @returns {Promise<JSON>} Retorna una promesa que se resuelve en un objeto JSON que contiene el resultado del fetch.

*/
const GetRequestGenerica = async (urlBase, parametros) =>{
 
  const requestOpciones = {
    method: "GET"
  };

  let url;

  //cadena de consulta a partir de los parámetros
  if(parametros!== undefined && parametros!== null){
      const queryString = Object.entries(parametros) 
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

      url = `${urlBase}?${queryString}`;
  }
  else
      url = urlBase;

      console.log(url);

  // agregamos la cadena de consulta a la URL base
  
  // Se realiza la petición utilizando la función fetch() la cual retorna una promesa.
  return fetch(url, requestOpciones)
    .then(response => response.json()) /*Transformamos la respuesta a formato json para poder manipularlo adecuadamente*/
    .then(result =>   result ) /*Retonamos el resultado en caso de exito en la resolucion de la promesa*/
    .catch(error => console.log('Error:', error)); /*Retornamos el error en caso de fracaso en la resolucion de la promesa*/
    
}

/**
Mapea los productos que envia la API y retorna un array de productos listo para ser utilizado.
@param {Array} productos - Array de productos tal cual lo mando la API.
@param {int} precioXScoreAlimenticio - valor por cada punto del score alimenticio cada 100 gramos, utilizado para determinar que precio va a tener el producto.
@returns {Array} productos listos para usar.
*/
const MapearProductos = (productos, precioXScoreAlimenticio) =>{
  const productosModificados = productos.products.map(producto => {
    if (producto.id === undefined ||
      producto.product_name === undefined ||
      producto.image_url === undefined ||
      producto.categories === undefined ||
      producto.nutriments === undefined ||
      producto.nutriments["nutrition-score-fr_100g"] === undefined ||
      producto.brands === undefined ||
      producto.quantity === undefined)
      {
        return null; 
      }
      return {
          id: producto.id,
          nombre: producto.product_name,
          imagen : producto.image_url,
          precio : Math.abs(producto.nutriments["nutrition-score-fr_100g"] * precioXScoreAlimenticio),
          marca: producto.brands,
          peso: producto.quantity,

      }
    });

    return productosModificados.filter(producto => producto !== null);
}

/*Retorna los productos de una categoria especificada*/
const ObtenerProductosDeCategoria = async (categoria) => {
  let productos = await GetRequestGenerica(`https://es.openfoodfacts.org/categoria/${categoria}.json`); /***/
  productosListos = MapearProductos(productos, 60);
  return productosListos;
 

} 

/*Obtiene productos aleatorias segun la cantidad y pagina indicada*/
const ObtenerProductosAleatorios = async (cantidadPorPagina, pagina) =>{
  let productos = await GetRequestGenerica("https://es.openfoodfacts.org/cgi/search.pl",{json: true, action : "process", page_size: cantidadPorPagina, page : pagina});
  productosListos = MapearProductos(productos, 60);
  return productosListos;
}

const ObtenerProductoNombre = async (nombre) =>{
  let parametros = {
                    json: true, 
                    action : "process", 
                    search_terms : nombre
                  }

  let urlBase= "https://es.openfoodfacts.org/cgi/search.pl";

  let productos= await GetRequestGenerica(urlBase,parametros);


  productosListos = MapearProductos(productos, 60);

  return productosListos;

}


/*Categorias disponibles en la API*/
const CATEGORIAS = ["Lácteos","Bebidas","cereales-para-el-desayuno","legumbres-secas","Condimentos","Quesos","galletas-y-pasteles"]

const UtilizandoFetchPrueba = async () => {
  /*Productos obtenidos de una categoria*/
  let productosCat = await ObtenerProductosDeCategoria(CATEGORIAS[4]); /***/
  console.log("PRODUCTOS POR CATEGORIA");
  console.log(productosCat);

  /*Productos obtenidos al azar*/
  let productosAzar = await ObtenerProductosAleatorios(10,1); /***/
  console.log("PRODUCTOS ALEATORIOS POR PAGINA");
  console.log(productosAzar);

} 

//#endregion 

//#region EXPLICACION REGION
// productosListos = await ObtenerProductosDeCategoria(CATEGORIAS[4]); 
//   productosListos = await ObtenerProductosAleatorios(10,1); 
//#endregion
const prodCont = document.getElementById("prodCont");
const verCarrito = document.getElementById("verCarrito");
const modalContainer = document.getElementById("modalContainer");
const botonBusquedaNombre = document.getElementById("bt")
let productosListos=[];

botonBusquedaNombre.addEventListener('click',(e) =>{
  e.preventDefault ();
  RealizarBusqueda();
})


let carrito = JSON.parse(localStorage.getItem("carrito"));

mostrarCarrito();

function crearCard(prod) {

  let content = document.createElement("div");
  content.className = "card-prod";
  content.innerHTML = `
    <img class=img-prod src="${prod.imagen}">
    <h3 class=texto-prod> ${prod.nombre}</h3>
    <p class=texto-prod>Peso: ${prod.peso}</p>
    <p class=texto-prod>Precio $${prod.precio}</p>
    <p class=texto-prod>Marca: ${prod.marca}</p>
    <button id="bt-${prod.id}">Agregar</button> 
  `;
  
  prodCont.appendChild(content);

  let boton = document.getElementById(`bt-${prod.id}`);
  
   boton.addEventListener('click', () => {
   agregarAlCarrito(prod);
   });

   
}

const RealizarBusqueda =  async () =>{
  const input = document.getElementById("inputBusqueda")
  let textIngresado =   input.value; 

  let productos = await  ObtenerProductoNombre(textIngresado);
  productosListos = productos;
  let divProductos = document.getElementById("prodCont") ;
  divProductos.innerHTML = "";
  mostrarProductos();
  console.log("Productos Listos por nombre:");
  console.log(productosListos);

}




function comprar() {
  productos.forEach((prod) =>
    document.getElementById(`bt-${prod.id}`).addEventListener
    (`click`, () => {
      console.log(prod)
    })
  );
}


function agregarAlCarrito(prod) {
  let existe = carrito.some((element) => element.id === prod.id);
  if (existe === false) {
    prod.cantidad = 1;
    carrito.push(prod);
  } else {
    let miProd = carrito.find((element) => element.id == prod.id);
    miProd.cantidad++;
  }
 localStorage.setItem("carrito",JSON.stringify(carrito))
  console.log(carrito);
}

function mostrarCarrito() {
  verCarrito.addEventListener("click", () => {
    modalContainer.innerHTML = "";
    modalContainer.style.display = "flex";
    const modalHeader = crearModalHeader();
    modalContainer.append(modalHeader);
    carrito.forEach((prod) => {
      let carritoContent = crearCarritoContent(prod);
      modalContainer.append(carritoContent);
    });
    const total = carrito.reduce((a, b) => a + (b.precio * b.cantidad), 0);
    const totalBuying = crearTotalContent(total);
    modalContainer.append(totalBuying);
  });
}

function btnCategorias (){



  
}

function crearModalHeader() {
  const modalHeader = document.createElement("div");
  modalHeader.className = "modalHeader";
  modalHeader.innerHTML = `
    <h1 class="modal-titulo">Carrito.</h1>
  `;
  const modalbutton = document.createElement("h1");
  modalbutton.innerText = "X";
  modalbutton.className = "modal-header-button";
  modalbutton.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });
  modalHeader.append(modalbutton);
  return modalHeader;
}

function crearCarritoContent(prod) {
  let carritoContent = document.createElement("div");
  carritoContent.className = "card-carrito";
  carritoContent.innerHTML = `
    <img class=img-carrito src="${prod.imagen}">
    <h3 class=texto-prod>${prod.nombre}</h3>
    <p class=texto-prod>${prod.peso}</p>
    <p class=texto-prod>${prod.precio}</p>
    <p class=texto-prod>${prod.categoria}</p>
    <p class=texto-prod>Cantidad: ${prod.cantidad}</p>
  `;
  return carritoContent;
}

function crearTotalContent(total) {
  const totalBuying = document.createElement("div");
  totalBuying.className = "total-content";
  totalBuying.innerHTML = `total a pagar:$ ${total}`;
  return totalBuying;
}

const init = async () => {
  productosListos = await ObtenerProductosAleatorios(20,1);
 mostrarProductos();
}

const mostrarProductos = () =>{ 
  productosListos.forEach((prod) => {
    crearCard(prod);
  });
  mostrarCarrito();
}

init()



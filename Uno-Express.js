const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const partides = [];

class Partida {
  constructor(codiPartida) {
    this.codiPartida = codiPartida;
    this.mans = [];
    this.repartirCartes(7);
    this.ultimaCarta = null;
    this.turnoActual = 1;
    this.jugadoresQueHanPasado = 0;
    this.establecerCartaInicial();
  }

  establecerCartaInicial() {
    const baralla = crearBaralla();
    const cartasNumerosColores = baralla.filter(carta => {
      const [, valor] = carta.split(' ');
      return !['Salta', 'Inverteix', 'AgafaDos'].includes(valor);
    });
    shuffle(cartasNumerosColores);
    this.cartaInicial = cartasNumerosColores[0];
  }
  generarCartaRandom() {
    const baralla = crearBaralla();
    shuffle(baralla);
    return baralla.pop();
  }
  

  repartirCartes(cartesPerJugador) {
    const baralla = crearBaralla();
    shuffle(baralla);

    const numJugadors = 2;
    const cartesTotals = cartesPerJugador * numJugadors;

    if (baralla.length >= cartesTotals) {
      for (let i = 0; i < numJugadors; i++) {
        const maJugador = baralla.slice(i * cartesPerJugador, (i + 1) * cartesPerJugador);
        this.mans.push(maJugador);
      }
    } else {
      console.log("No hay suficientes cartas para repartir a los jugadores.");
    }
  }

  mostrarMaJugador(numJugador) {
    if (numJugador > 0 && numJugador <= this.mans.length) {
      return this.mans[numJugador - 1];
    } else {
      return [];
    }
  }

  tirarCarta(numJugador, carta) {
    if (numJugador === this.turnoActual) {
      const maJugador = this.mans[numJugador - 1];
  
      if (this.ultimaCarta === null) {
        if (maJugador.includes(carta) && this.esMismaCartaInicial(carta)) {
          const cartaIndex = maJugador.indexOf(carta);
          maJugador.splice(cartaIndex, 1);

          if (carta.includes("AgafaDos")) {
            const jugadorSiguiente = this.turnoActual % 2 + 1;

            for (let i = 0; i < 2; i++) {
              this.mans[jugadorSiguiente - 1].push(this.generarCartaRandom());
            }
            this.jugadoresQueHanPasado = 2;
            this.turnoActual = numJugador;

            return `El jugador ${numJugador} ha tirado ${carta}. El jugador ${jugadorSiguiente} ha robado 2 cartas. No puede tirar en la siguiente ronda.`;
          } else if (carta.includes("Salta")) {
            this.turnoActual = numJugador;
            this.ultimaCarta = carta;
            return `El jugador ${numJugador} ha tirado ${carta}. Ha saltado el turno del jugador ${numJugador % 2 + 1}.`;
          } else if (carta.includes("Inverteix")) {
            this.turnoActual = numJugador;
            this.ultimaCarta = carta;
            return `El jugador ${numJugador} ha tirado ${carta}. Se ha invertido el turno. Ahora le toca al jugador ${numJugador}.`;
          } else {
            this.turnoActual = this.turnoActual % 2 + 1;
          }

          this.ultimaCarta = carta;

          return `El jugador ${numJugador} ha tirado una carta: ${carta}`;
        } else {
          return `La carta no está en la mano del jugador ${numJugador} o no puede ser tirada.`;
        }
      } else {
        if (this.puedeTirarCarta(carta)) {
          const cartaIndex = maJugador.indexOf(carta);
          if (cartaIndex !== -1) {
            maJugador.splice(cartaIndex, 1);

            if (carta.includes("AgafaDos")) {
              const jugadorSiguiente = this.turnoActual % 2 + 1;

              for (let i = 0; i < 2; i++) {
                this.mans[jugadorSiguiente - 1].push(this.generarCartaRandom());
              }

              this.jugadoresQueHanPasado = 2;
              this.turnoActual = numJugador;

              return `El jugador ${numJugador} ha tirado ${carta}. El jugador ${jugadorSiguiente} ha robado 2 cartas. No puede tirar en la siguiente ronda.`;
            } else if (carta.includes("Salta")) {
              this.turnoActual = numJugador;
              this.ultimaCarta = carta;
              return `El jugador ${numJugador} ha tirado ${carta}. Ha saltado/bloqueado el turno del jugador ${numJugador % 2 + 1}.`;
            } else if (carta.includes("Inverteix")) {
              this.turnoActual = numJugador;
              this.ultimaCarta = carta;
              return `El jugador ${numJugador} ha tirado ${carta}. Se ha invertido el turno. Ahora le toca al jugador ${numJugador}.`;
            } else {
              this.turnoActual = this.turnoActual % 2 + 1;
            }

            this.ultimaCarta = carta;

            return `El jugador ${numJugador} ha tirado una carta: ${carta}`;
          } else {
            return `La carta no está en la mano del jugador ${numJugador}`;
          }
        } else {
          return `Error: Debes tirar una carta que tenga el mismo color, el mismo número o una carta especial ("Salta", "Inverteix", "AgafaDos").`;
        }
      }
    } else {
      return "No es tu turno para tirar.";
    }
  }

  esMismaCartaInicial(carta) {
    const [inicialColor, inicialNumero] = this.cartaInicial.split(' ');
    const [color, numero] = carta.split(' ');

    return color === inicialColor || numero === inicialNumero;
  }

  puedeTirarCarta(carta) {
    if (!this.ultimaCarta) {
      return true; 
    }
  
    const [ultimaColor, ultimaNumero] = this.ultimaCarta.split(' ');
    const [color, numero] = carta.split(' ');
  
    if (numero === "Salta" || numero === "Inverteix" || numero === "AgafaDos") {
      return color === ultimaColor || numero === ultimaNumero;
    }
  
    return color === ultimaColor || numero === ultimaNumero;
  }

  afegirMaJugador(maJugador) {
    this.mans.push(maJugador);
  }
}

function crearBaralla() {
  const colors = ["Vermell", "Verd", "Blau", "Groc"];
  const valors = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Salta", "Inverteix", "AgafaDos"];

  const baralla = [];

  for (const color of colors) {
    for (const valor of valors) {
      baralla.push(`${color} ${valor}`);
    }
  }

  return baralla;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

app.post('/api/iniciarJoc/:codiPartida', (req, res) => {
  const codiPartida = parseInt(req.params.codiPartida);
  if (!esPartidaValida(codiPartida)) {
    const novaPartida = new Partida(codiPartida);

    partides.push(novaPartida);
    res.send(`Joc iniciat amb èxit. Codi de partida: ${codiPartida}. Carta inicial: ${novaPartida.cartaInicial}`);
  } else {
    res.send(`El codi de partida ${codiPartida} ja existeix. Si us plau, tria'n un altre.`);
  }
});

app.get('/api/mostrarCartes/:codiPartida/:numJugador', (req, res) => {
  const codiPartida = parseInt(req.params.codiPartida);
  const numJugador = parseInt(req.params.numJugador);
  if (esPartidaValida(codiPartida)) {
    res.json(partides[codiPartida - 1].mostrarMaJugador(numJugador));
  } else {
    res.json([]);
  }
});

app.put('/api/tirarCarta/:codiPartida/:carta/:numJugador', (req, res) => {
  const codiPartida = parseInt(req.params.codiPartida);
  const cartaTirada = req.params.carta;
  const numJugador = parseInt(req.params.numJugador);

  if (esPartidaValida(codiPartida)) {
    const partida = partides[codiPartida - 1];
    const resultadoTirada = partida.tirarCarta(numJugador, cartaTirada);
    res.send(resultadoTirada);
  } else {
    res.send("Codi de partida no vàlid.");
  }
});

app.put('/api/moureJugador/:codiPartida/passa/:numJugador', (req, res) => {
  const codiPartida = parseInt(req.params.codiPartida);
  const numJugador = parseInt(req.params.numJugador);

  if (esPartidaValida(codiPartida)) {
    const partida = partides[codiPartida - 1];

    if (numJugador === partida.turnoActual) {
      partida.turnoActual = partida.turnoActual % 2 + 1;
      partida.jugadoresQueHanPasado = 0;

      const baralla = crearBaralla();
      shuffle(baralla);

      const cartaRobada = baralla.pop();
      partida.mans[numJugador - 1].push(cartaRobada);

      res.send(`El turno se ha pasado al jugador ${partida.turnoActual}. El jugador ${numJugador}`);
    } else {
      res.send("No es tu turno para pasar.");
    }
  } else {
    res.send("Codi de partida no vàlid.");
  }
});

app.delete('/api/acabarJoc/:codiPartida', (req, res) => {
  const codiPartida = parseInt(req.params.codiPartida);
  if (esPartidaValida(codiPartida)) {
    partides.splice(codiPartida - 1, 1);
    console.log(`Joc finalitzat ${codiPartida}`);
    res.send(`Joc finalitzat ${codiPartida}`);
  } else {
    res.send("Codi de partida no vàlid.");
  }
});

function esPartidaValida(codiPartida) {
  return codiPartida <= partides.length && codiPartida > 0;
}

app.listen(8080, () => {
  console.log(`Servidor en funcionament a http://localhost:8080`);
});

# Combinatorix

Combinatorix - platforma do badania różnych algorytmów SI dla gier kombinatorycznych tworzona w ramach projektu
zaliczeniowego na przedmiocie _Wprowadzenie do teorii gier_.

## Uruchomienie aplikacji we własnym środowisku

Uwaga! Proszę stosować _node.js_ w wersji co najmniej 16.

1. Pobranie repozytorium.
2. Uruchomienie komendy `npm install`.
3. Uruchomienie komendy `npx gulp`, która powinna uruchomić proces budowania przystosowany do dalszego rozwoju wraz z uruchomieniem prostego serwera.
4. Uruchomienie adresu `http://localhost:8000` w przeglądarce.

## Dodanie gry

1. Utworzenie katalogu w ścieżce `src/games` z nazwą odpowiadającą grze.
2. Skopiowanie plików z folderu `_template`.
3. Wpisanie nazwy gry w pliki `config.json`.
4. W pliku `authors.md` (format Markdown) wpisujemy notatkę dotyczącą oryginalnych autorów gry i implementacji.
5. W pliku `description.md` wpisujemy opis i zasady gry.
6. Uzupełnienie pozostałych plików wg etapu realizacji projektu.

Wszystkie obrazki w plikach MD należy ładować ze ścieżki `images/nazwa gry/nazwa pliku obrazka`. Z kolei w pliku CSS
wczytujemy ze ścieżki `../../images/nazwa gry/nazwa pliku obrazka`.

### Podstawowa wersja gry (gracz i gracz losowy)

1. W pliku `game.logic.js` uzupełniamy:
    1. `generateInitialState`,
    2. `generateMoves`,
    3. `generateStateAfterMove`,
    4. `isStateTerminal`.
2. W pliku `game.visualization.js` uzupełniamy:
    1. `drawState`,
    2. `handleHumanTurn`,
    3. `getTruePlayerName`,
    4. `getReadableMoveDescription`,
    5. `getReadableWinnerName`.

W celu wizualizacji planszy można użyć również pliku `game.css`.

Do dyspozycji są biblioteki [Bootstrap 5.3.2](https://getbootstrap.com/), [JQuery 3.7.1](https://jquery.com/) oraz
[JQuery UI 1.13.2](https://jqueryui.com/).

### AlphaBeta

1. W pliku `game.logic.js` uzupełniamy:
    1. `evaluateState` (funkcja oceny dla wybranej gry),
    2. `generateUniqueKey` (opcjonalnie).

W pliku `game.logic.js` dodajemy konfigurację dla graczy:

```js
...
const players = [
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (łatwy)", maxDepth: 3, printTree: true },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (średni)", maxDepth: 5, printTree: false },
    { type: PlayerTypes.ALPHABETA, label: "AlphaBeta (trudny)", maxDepth: 7, printTree: false },
];
```

Gdzie `maxDepth` oznacza głębokość drzewa algorytmu, co powinno przełożyć się na siłę SI. Dobór głębokości drzewa
powinien zostać dobrany empirycznie do wybranej gry.

Metoda `generateUniqueKey` powinna zwracać unikatowy hash dla stanu gry oraz gracza (`state` i `player`). Jedną z możliwych implementacji jest
biblioteka [_object-hash_](https://github.com/puleos/object-hash).

Dodatkowa flaga `printTree` pozwala włączyć _drukowanie_ drzewa gry.

### MCTS

1. W pliku `game.logic.js` uzupełniamy:
    1. `computeMCTSNodeValue` (funkcja wartości węzła drzewa gry),
    2. `MCTSPlayOut` (symulacja losowa),
    3. `getBestMCTSNode` (wybór najlepszego ruchu).

W pliku `game.logic.js` dodajemy konfigurację dla graczy:

```js
...
const players = [
    { type: PlayerTypes.MCTS, label: "MCTS (łatwy)", iterations: 1000 },
    { type: PlayerTypes.MCTS, label: "MCTS (średni)", iterations: 3000 },
    { type: PlayerTypes.MCTS, label: "MCTS (trudny)", iterations: 7000 },
];
```

Gdzie `iterations` oznacza liczbę iteracji algorytmu, co powinno przełożyć się na siłę SI. Dobór liczby iteracji
powinien zostać dobrany empirycznie do gry.

## Dodatkowe pliki JavaScript

Istnieje możliwość dodania kolejnych plików JavaScript do skryptu gry. Dodatkowe pliki
należy dodać do pliku `config.json` jako tablica plików o kluczu `extraJsFiles` (pliki dla wizualizacji gry) oraz `webWorkerExtraJsFiles` (pliki dla algorytmów SI). Dodatkowe pliki muszą znaleźć się w katalogu `js` w katalogu gry.

```
{
    "title": "Template",
    "extraJsFiles": ["extra.js"],
    "webWorkerExtraJsFiles": ["extra.js"]
}
```

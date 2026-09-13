# Kontrakty i projekt interfejsu

## Zakres
Osobisty czytnik Windows x64. Jedno okno: biblioteka i kategorie po lewej, wyszukiwarka i sortowanie nad listą, pełna treść po prawej. Pierwsza strona listy zawiera 40 rekordów; przycisk Pokaż więcej rozszerza listę. Stan pusty prowadzi do wyboru wiadomości lub zmiany filtrów. Brak sieci pokazuje jawny komunikat i lokalną kopię.

## Model danych
`Post = { id: string, title: string, category: string, date: YYYY-MM-DD | '', source: string, excerpt: string, full: string, hot: boolean, tags: string[] }`

`Library = { news: Post[], favorites: Record<string, Post>, theme: 'light' | 'dark' | 'system', updated: ISODate | null }`

Ulubione zawierają kopię posta z chwili zapisania. Usunięcie posta z serwera nie usuwa ulubionego. Zapis kolejkuje migawki, zapisuje do pliku tymczasowego, następnie zmienia nazwę. Błędny plik przy starcie zatrzymuje uruchomienie bez nadpisania. Jedna instancja aplikacji ogranicza konkurencyjne zapisy.

## API preload
- library(): Promise<Library>
- refresh(): Promise<Library> — stały adres HTTPS, limit czasu 20 sekund, walidacja wyniku.
- favorite(id): Promise<Record<string, Post>> — przełączanie ulubionego.
- theme(value): Promise<void> — tylko trzy dopuszczalne wartości.
- copy(id): Promise<boolean> — pełny tekst i adres posta.
- print(id): Promise<{success: boolean, reason?: string}> — systemowy dialog, osobny dokument bez interfejsu.
- open(id): Promise<void> — wyłącznie stała domena serwisu z zakodowanym ID.

Renderer nie dostaje dostępu do Node.js ani plików. Sandbox, izolacja kontekstu, CSP, blokowanie nawigacji i nowych okien oraz weryfikacja nadawcy IPC ograniczają powierzchnię ataku. Tekst serwisu trafia do textContent, a wydruk koduje HTML.

## System wizualny
Źródłem prawdy są tokeny CSS w src/styles.css. docs/generated-tokens.json zawiera wygenerowaną paletę pomocniczą ze skilla ui-design-system; końcowe tokeny semantyczne dopasowano do obu motywów.

| Rola | Jasny | Ciemny |
|---|---|---|
| Tło | #F5F6F8 | #10181E |
| Powierzchnia | #FFFFFF | #172229 |
| Tekst | #192B35 | #E7EEF0 |
| Tekst drugorzędny | #586A74 | #A4B5BE |
| Akcent | #086D60 | #7DE3C3 |
| Aktywna powierzchnia | #E6F4EE | #213D37 |

Segoe UI, podstawowy tekst 14 px, treść artykułu 15 px i interlinia 1.85; nagłówki 23–29 px. Odstępy bazują na 8 px, promień kart 12 px. Przyciski głównych działań mają co najmniej 44 px. Kategorie mają zwartą wysokość 36 px dla obsługi myszy na desktopie. Widoczny fokus, natywne przyciski/selecty, etykiety dostępności, aria-pressed dla wyborów i regiony statusu. Minimalne okno 960×640, przewijane niezależnie panele.

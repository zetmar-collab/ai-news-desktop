# Zasady ochrony prywatności — AI-News

Ostatnia aktualizacja: 25 września 2026 r.

AI-News to aplikacja desktopowa dla Windows wydawana przez Marka Zettla (zetmar). Nie wymaga konta. Nie zawiera reklam, analityki ani mechanizmów śledzących.

## Jakie dane przetwarza aplikacja

Aplikacja pobiera publiczne wiadomości z `https://aievolutionnews.live/api/news` przy uruchomieniu oraz po wybraniu przycisku „Odśwież”. Podczas tego połączenia serwer źródłowy może otrzymać zwykłe dane techniczne połączenia, w tym adres IP. Zasady przetwarzania tych danych przez serwis źródłowy określa jego operator.

Aplikacja przechowuje lokalnie na urządzeniu pobrane wiadomości, ulubione posty i wybrany motyw. Dane znajdują się w pliku `library.json` w folderze danych aplikacji użytkownika systemu Windows. Ulubione, wyszukiwania ani ustawienia nie są wysyłane przez AI-News do wydawcy aplikacji. Aplikacja nie tworzy kont ani profili użytkowników.

## Schowek, drukowanie i łącza

Po wybraniu „Kopiuj” treść posta i link trafiają do schowka Windows. Po wybraniu „Drukuj” aplikacja przekazuje treść posta do systemowego okna drukowania. Po wybraniu „Otwórz post na stronie” domyślna przeglądarka otwiera serwis źródłowy. Te działania następują tylko na żądanie użytkownika.

## Przechowywanie i usuwanie

Dane pozostają na urządzeniu, aby wiadomości i ulubione były dostępne offline. Ulubiony post można usunąć w aplikacji. Aby usunąć całą lokalną bibliotekę, zamknij AI-News i usuń plik `library.json` z folderu danych aplikacji. Odinstalowanie aplikacji może nie usunąć plików profilu użytkownika.

## Kontakt

Pytania dotyczące aplikacji i tych zasad można zgłaszać w [repozytorium projektu](https://github.com/zetmar-collab/ai-news-desktop/issues).

# Microsoft Store i MSIX

## Tożsamość pakietu

Potwierdzona nazwa zarezerwowana dla produktu `9PDXC20N59XF` to **AI-News** (z myślnikiem). Pole `displayName` musi mieć dokładnie tę wartość; `AI News` ze spacją jest inną nazwą i zostaje odrzucone przez Partner Center. Dotyczy to zarówno `Package/Properties/DisplayName`, jak i `Applications/Application/VisualElements/@DisplayName`. Lokalny test kontroluje zgodność z podaną nazwą, ale nie zastępuje walidacji ani certyfikacji w Partner Center.

Przed kompilacją w Partner Center utwórz aplikację i zarezerwuj jej nazwę. W sekcji **Product identity** skopiuj dokładnie pola **Package/Identity name** oraz **Publisher**. Są własnością wpisu w Store i nie mogą być zastąpione nazwą konta GitHub ani lokalnym certyfikatem.

Wklej je do lokalnego pliku `store-identity.json`, utworzonego z `store-identity.example.json`. Ten plik jest ignorowany przez Git, aby nie utrwalać danych konta wydawcy w repozytorium.

## Pakiet

`npm.cmd run build:msix` buduje architekturę x64. Pakiet zawiera pełnotrustową aplikację Electron, lokalne ikony skalowane od 44 do 310 pikseli oraz tylko uprawnienie `runFullTrust`. Aplikacja pobiera wiadomości po HTTPS, ale nie wymaga dostępu do kamery, mikrofonu ani biblioteki użytkownika.

`npm.cmd run test:msix` rozpakowuje gotowy MSIX i sprawdza manifest. W Store przesyłaj plik `.msix` z folderu `release`, bez lokalnego podpisu: Partner Center zastąpi go podpisem Microsoft.

## Wersje

Każda kolejna publikacja musi podnieść `version` w `package.json`. Numer ma format `major.minor.patch.build`, a `electron-builder` przekształca semver na format akceptowany przez Windows.

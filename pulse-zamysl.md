# Pulse — zamysł

Tu zapisuję pomysły na nowe funkcje Pulse, zanim zaczniemy je robić.
Główna specyfikacja apki jest w pliku „Pulse — projekt programistyczny.pdf”.

---

## Pomysł 1: Planer dnia

**Data dodania:** 2026-10-22
**Status:** tylko pomysł (jeszcze nie robimy)

### O co chodzi
W Pulse będzie planer dnia. Użytkownik wpisuje swój plan na dziś
(np. „8:00–9:00 szkoła”, „16:00–17:00 trening”), a apka pokazuje:

- **Plan na dziś** — listę wszystkich zadań na dzisiaj, po kolei według godzin.
- **Co teraz** — zadanie, które powinno być robione w tej chwili
  (na podstawie aktualnej godziny).

Przykład: jest 16:20, w planie jest „16:00–17:00 trening”,
więc apka pokazuje: „Teraz: trening (do 17:00)”.

### Jak to pasuje do reszty Pulse
- Pulse pokazuje „stan” znajomych. Zadanie z „co teraz” mogłoby
  (jeśli użytkownik chce) być jego stanem w feedzie, np. „Teraz: trening 🏋️”.
- Dzięki temu stan nie musi być wpisywany ręcznie za każdym razem.

### Pytania na później
- Co pokazać, gdy w tej chwili nie ma żadnego zadania? (np. „Wolne” albo następne zadanie)
- Czy plan jest prywatny, czy znajomi mogą go zobaczyć?
- Czy zadania mogą na siebie nachodzić (dwa naraz)?
- Czy można odhaczyć zadanie jako zrobione?

### Kiedy
Po zrobieniu MVP (logowanie, znajomi, stan, feed, reakcje).

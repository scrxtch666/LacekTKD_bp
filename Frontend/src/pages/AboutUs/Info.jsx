import { Link, NavLink } from "react-router-dom";

function Info() {
  return (
    <>
      <div className="flex gap-5">
        <div className="card">
          <span className="font-bold text-2xl">Taekwondo LACEK</span>
          <p>
            Sportovní klub Taekwondo Lacek je významným oddílem taekwonda v
            České republice, sídlícím v Pelhřimově.
          </p>
          <p>
            Založen byl 19. května 1995 jako Klub Taekwondo WTF Humpolec a je
            nejstarším aktivně fungujícím oddílem taekwonda v zemi.
          </p>
          <p>
            V roce 2008 došlo k přejmenování na Sportovní klub Taekwondo Lacek a
            k přesunu sídla do Pelhřimova.
          </p>
          <p>
            Klub je otevřen všem zájemcům bez ohledu na věk, pohlaví či
            národnost a nabízí tréninky v Pelhřimově a Humpolci.
          </p>
          <p>
            Během své existence dosáhl klub mnoha úspěchů, včetně titulů mistra
            České republiky v letech 1999, 2000 a 2008 až 2019.
          </p>
          <p>
            Také pravidelně vítězil v České národní lize od roku 2007 do roku
            2018.
          </p>
          <p>V roce 2013 obsadil 4. místo na Mistrovství Evropy oddílů.</p>
          <p>
            Tréninky v Pelhřimově probíhají na ZŠ Komenského v pondělí a středu
            od 16:00 do 18:00 pro začátečníky a od 18:00 do 20:00 pro pokročilé.
          </p>
          <p>
            Pro více informací můžete navštívit oficiální webové stránky klubu
            na adrese <a href="https://www.tkdlacek.cz/">www.tkdlacek.cz</a>{" "}
            nebo kontaktovat trenéra Petra Lacka na telefonním čísle +420 724
            209 910 či e-mailu{" "}
            <a href="mailto:tkdlacek@gmail.com">tkdlacek@gmail.com</a>.
          </p>
          <p>
            Pro zájemce do řad našeho oddílu, zde pro vás máme
            <Link to="/register" className="px-1 text-customGreen font-medium hover:underline">
              registrační formulář.
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Info;

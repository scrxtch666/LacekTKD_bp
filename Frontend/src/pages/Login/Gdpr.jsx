import {
  Shield,
  User,
  Database,
  Lock,
  Mail,
  Phone,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

function Gdpr() {
  return (
    <div className="mx-auto space-y-6 pb-10">
      <div className="devider">Ochrana osobních údajů (GDPR)</div>

      <div className="bg-customWhite rounded-2xl shadow-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-customGreen" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Správce osobních údajů</h2>
            <p className="text-sm text-gray-500">TKD Lacek, z.s.</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 space-y-1 pl-13">
          <p>
            Oddíl taekwondo TKD Lacek zpracovává osobní údaje svých členů a
            závodníků v souladu s nařízením Evropského parlamentu a Rady (EU)
            2016/679 (GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních
            údajů.
          </p>
          <p className="mt-2">
            Kontakt správce:{" "}
            <a
              href="mailto:lacek.petr@seznam.cz"
              className="text-customGreen underline"
            >
              lacek.petr@seznam.cz
            </a>
          </p>
        </div>
      </div>

      <div className="bg-customWhite rounded-2xl shadow-md p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Database size={18} className="text-customGreen" /> Jaké osobní údaje
          zpracováváme
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              icon: <User size={15} />,
              title: "Identifikační údaje",
              items: [
                "Jméno a příjmení",
                "Datum narození",
                "Uživatelské jméno (login)",
              ],
            },
            {
              icon: <Mail size={15} />,
              title: "Kontaktní údaje",
              items: ["E-mailová adresa", "Telefonní číslo"],
            },
            {
              icon: <FileText size={15} />,
              title: "Závodní údaje",
              items: [
                "Váhová kategorie",
                "Věková skupina",
                "Pás (technický stupeň)",
                "Výsledky z turnajů (umístění)",
                "Přihlášky na turnaje a zkoušky",
              ],
            },
            {
              icon: <Lock size={15} />,
              title: "Přihlašovací údaje",
              items: [
                "Zahashované heslo (bcrypt)",
                "JWT token (pouze v prohlížeči)",
              ],
            },
          ].map((section) => (
            <div key={section.title} className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                <span className="text-customGreen">{section.icon}</span>
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-gray-600 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-customGreen flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-customWhite rounded-2xl shadow-md p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-customGreen" /> Účel a právní
          základ zpracování
        </h2>
        <div className="space-y-3 text-sm text-gray-600">
          {[
            {
              title: "Správa členství a závodníků",
              legal: "Oprávněný zájem správce (čl. 6 odst. 1 písm. f) GDPR)",
              desc: "Vedení evidence členů oddílu, správa závodních profilů a výsledků.",
            },
            {
              title: "Přihlašování na turnaje a zkoušky",
              legal: "Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR)",
              desc: "Zpracování přihlášek závodníků na turnaje a technické zkoušky.",
            },
            {
              title: "Provoz webové aplikace",
              legal: "Souhlas subjektu (čl. 6 odst. 1 písm. a) GDPR)",
              desc: "Registrace účtu, přihlašování a správa osobního profilu v systému.",
            },
            {
              title: "Zveřejnění výsledků",
              legal: "Oprávněný zájem / souhlas",
              desc: "Zveřejnění výsledků závodníků na webu oddílu (jméno, příjmení, umístění).",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border-l-2 border-customGreen pl-4 py-1"
            >
              <p className="font-semibold text-gray-800">{item.title}</p>
              <p className="text-xs text-customGreen mb-0.5">{item.legal}</p>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-customWhite rounded-2xl shadow-md p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-customGreen" /> Doba uchovávání údajů
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-800">Údaje účtu:</span> Po
            dobu trvání členství, po jeho ukončení max. 3 roky z důvodu
            oprávněného zájmu.
          </p>
          <p>
            <span className="font-medium text-gray-800">Výsledky turnajů:</span>{" "}
            Archivovány po dobu existence oddílu jako sportovní záznamy.
          </p>
          <p>
            <span className="font-medium text-gray-800">
              Zamítnuté žádosti o registraci:
            </span>{" "}
            Okamžitě po zamítnutí nebo na žádost.
          </p>
          <p>
            <span className="font-medium text-gray-800">
              Přihlašovací záznamy:
            </span>{" "}
            JWT tokeny expirují po 7 dnech.
          </p>
        </div>
      </div>

      <div className="bg-customWhite rounded-2xl shadow-md p-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User size={18} className="text-customGreen" /> Vaše práva
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
          {[
            {
              title: "Právo na přístup",
              desc: "Máte právo vědět, jaké údaje o vás zpracováváme.",
            },
            {
              title: "Právo na opravu",
              desc: "Můžete požádat o opravu nepřesných údajů.",
            },
            {
              title: "Právo na výmaz",
              desc: "Za podmínek GDPR můžete požádat o smazání svých údajů.",
            },
            {
              title: "Právo na omezení zpracování",
              desc: "Můžete požádat o omezení zpracování vašich údajů.",
            },
            {
              title: "Právo na přenositelnost",
              desc: "Máte právo získat své údaje ve strukturovaném formátu.",
            },
            {
              title: "Právo odvolat souhlas",
              desc: "Souhlas se zpracováním lze kdykoli odvolat, aniž by to ovlivnilo zákonnost předchozího zpracování.",
            },
          ].map((right) => (
            <div key={right.title} className="bg-gray-50 rounded-xl p-3">
              <p className="font-semibold text-gray-800 mb-1">{right.title}</p>
              <p>{right.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Svá práva uplatňujte na e-mailu:{" "}
          <a
            href="mailto:lacek.petr@seznam.cz"
            className="text-customGreen underline"
          >
            lacek.petr@seznam.cz
          </a>
          . Máte také právo podat stížnost u dozorového úřadu –{" "}
          <a
            href="https://www.uoou.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-customGreen underline"
          >
            Úřad pro ochranu osobních údajů (ÚOOÚ)
          </a>
          .
        </p>
      </div>

      <div className="bg-customWhite rounded-2xl shadow-md p-6">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Lock size={18} className="text-customGreen" /> Zabezpečení údajů
        </h2>
        <p className="text-sm text-gray-600">
          Veškerá hesla jsou ukládána v zahashované podobě (bcrypt). Přístup k
          osobním údajům je omezen pouze na administrátory a trenéry oddílu.
          Data jsou uchovávána na zabezpečeném serveru. Komunikace probíhá
          prostřednictvím šifrovaného spojení.
        </p>
      </div>
    </div>
  );
}

export default Gdpr;

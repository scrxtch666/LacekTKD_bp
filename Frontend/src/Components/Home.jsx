import ShowcaseCarousel from "../pages/Home/ShowcaseCarousel";
import EventCardLatest from "../pages/Home/EventCardLatest";
import Calendar from "../pages/Home/Calendar";

const Home = () => {
  return (
    <>
      <ShowcaseCarousel />

      <div className="devider">aktuality</div>

      <EventCardLatest />

      <div className="devider">nadcházející akce</div>

      <Calendar />
    </>
  );
};

export default Home;

function Card({ user, img }) {
  return (
    <div className="chalid">
      <img src={img} alt="planet" />
      <h1>{user}</h1>
      <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Pariatur ea voluptate enim</p>
      <button>click</button>
    </div>
  );
}

export default Card;
import React, { useEffect, useState } from "react";
import "./App.css";

const TMDB_API_KEY = "54660943637f711c3d924d5c5526e78e";

const App = () => {
  const [topUser, setTopUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const PRODUCTS_PER_PAGE = 6;

  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [movieSearch, setMovieSearch] = useState("");
  const [moviePage, setMoviePage] = useState(1);
  const MOVIES_PER_PAGE = 6;

  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ title: "", priority: "low" });
  useEffect(() => {
    const fetchTodosAndUsers = async () => {
      const todosRes = await fetch(
        "https://jsonplaceholder.typicode.com/todos"
      );
      const usersRes = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );

      const todosData = await todosRes.json();
      const users = await usersRes.json();

      const completedCount = todosData.reduce((acc, curr) => {
        if (curr.completed) {
          acc[curr.userId] = (acc[curr.userId] || 0) + 1;
        }
        return acc;
      }, {});

      const topUserId = Object.entries(completedCount).reduce((max, curr) =>
        curr[1] > max[1] ? curr : max
      )[0];

      const user = users.find((u) => u.id === Number(topUserId));
      setTopUser({ ...user, count: completedCount[topUserId] });
    };

    fetchTodosAndUsers();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      const [productsRes, usersRes] = await Promise.all([
        fetch("https://fakestoreapi.com/products"),
        fetch("https://jsonplaceholder.typicode.com/users"),
      ]);
      const data = await productsRes.json();
      const users = await usersRes.json();

      const enriched = data.map((item) => {
        const user = users[Math.floor(Math.random() * users.length)];
        return { ...item, username: user.username };
      });

      setProducts(enriched);
      setFilteredProducts(enriched);
    };

    fetchProducts();
  }, []);
  useEffect(() => {
    const filtered = products.filter((p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase())
    );
    setFilteredProducts(filtered);
    setProductPage(1);
  }, [productSearch, products]);
  useEffect(() => {
    const fetchMovies = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`
      );
      const data = await res.json();
      setMovies(data.results || []);
      setFilteredMovies(data.results || []);
    };

    fetchMovies();
  }, []);
  useEffect(() => {
    const filtered = movies.filter((m) =>
      m.title.toLowerCase().includes(movieSearch.toLowerCase())
    );
    setFilteredMovies(filtered);
    setMoviePage(1);
  }, [movieSearch, movies]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setTodos([...todos, { ...form, id: Date.now() }]);
    setForm({ title: "", priority: "low" });
  };
  const paginate = (items, currentPage, itemsPerPage) => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const productPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const moviePages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

  return (
    <div className="container">
      <section className="card">
        <h2> Most Todos Completed</h2>
        {topUser ? (
          <p>
            <strong>{topUser.name}</strong> with{" "}
            <strong>{topUser.count}</strong> completed todos!
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </section>
      <section className="card">
        <h2>Products with Usernames</h2>
        <input
          type="text"
          placeholder="Search products..."
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />
        <div className="grid">
          {paginate(filteredProducts, productPage, PRODUCTS_PER_PAGE).map(
            (p) => (
              <div key={p.id} className="product-card">
                <img src={p.image} alt={p.title} />
                <h4>{p.title}</h4>
                <p>👤 {p.username}</p>
                <p> ${p.price}</p>
              </div>
            )
          )}
        </div>
        <div className="pagination">
          {Array.from({ length: productPages }, (_, i) => (
            <button
              key={i}
              className={productPage === i + 1 ? "active" : ""}
              onClick={() => setProductPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Trending Movies</h2>
        <input
          type="text"
          placeholder="Search movies..."
          value={movieSearch}
          onChange={(e) => setMovieSearch(e.target.value)}
        />
        <div className="grid">
          {paginate(filteredMovies, moviePage, MOVIES_PER_PAGE).map((m) => (
            <div key={m.id} className="product-card">
              <img
                src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                alt={m.title}
              />
              <h4>{m.title}</h4>
              <p>⭐ {m.vote_average}</p>
            </div>
          ))}
        </div>
        <div className="pagination">
          {Array.from({ length: moviePages }, (_, i) => (
            <button
              key={i}
              className={moviePage === i + 1 ? "active" : ""}
              onClick={() => setMoviePage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>
      <section className="card">
        <h2>Create a Todo</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Enter todo title"
            value={form.title}
            onChange={handleChange}
          />
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit">Add Todo</button>
        </form>

        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={`priority-${todo.priority}`}>
              <strong>{todo.title}</strong> - <em>{todo.priority}</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default App;

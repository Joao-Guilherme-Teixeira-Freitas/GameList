import React, { useEffect, useState } from "react"
import "./App.css"

const API_BASE_URL = "https://games-test-api-81e9fb0d564a.herokuapp.com/api"
const EMAIL_HEADER = "teixeirafreitasjoaoguilherme@gmail.com"

interface Game {
  id: number
  title: string
  thumbnail: string
  short_description: string
  game_url: string
  genre: string
  platform: string
  publisher: string
  developer: string
  release_date: string
  freetogame_profile_url: string
}

export default function Home(): JSX.Element {
  const [games, setGames] = useState<Game[]>([])
  const [allGames, setAllGames] = useState<Game[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [genres, setGenres] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const gamesPerPage = 9
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showAllGames, setShowAllGames] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const timeout = setTimeout(() => {
          if (isMounted) {
            setErrorMessage(
              "O servidor demorou para responder, tente mais tarde."
            )
            setIsLoading(false)
          }
        }, 5000)

        const response = await fetch(`${API_BASE_URL}/data`, {
          headers: {
            "Content-Type": "application/json",
            "dev-email-address": EMAIL_HEADER
          }
        })

        clearTimeout(timeout)

        if (!response.ok) {
          throw new Error(
            response.status >= 500
              ? "O servidor falhou em responder, tente recarregar a página."
              : "O servidor não conseguirá responder por agora, tente voltar novamente mais tarde."
          )
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error("Formato de dados inválido.")
        }

        setAllGames(data)
        setGames(data)

        const uniqueGenres = Array.from(
          new Set(data.map((game: Game) => game.genre.toUpperCase()))
        )
        setGenres(uniqueGenres)

        setIsLoading(false)
      } catch (error: any) {
        setErrorMessage(error.message)
        setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const filteredGames = allGames.filter(
      game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedGenre === "" ||
          game.genre.toLowerCase() === selectedGenre.toLowerCase())
    )
    setGames(filteredGames)
    setCurrentPage(1)
  }, [searchTerm, selectedGenre, allGames])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleGenreSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(event.target.value)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < Math.ceil(games.length / gamesPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const indexOfLastGame = currentPage * gamesPerPage
  const indexOfFirstGame = indexOfLastGame - gamesPerPage
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame)

  const handleSearchFocus = (isFocused: boolean) => {
    setIsSearchFocused(isFocused)
  }

  const handleToggleAllGames = () => {
    setShowAllGames(!showAllGames)
  }

  const renderGameCards = () => {
    if (showAllGames) {
      return games.map(game => (
        <div key={game.id} className="card">
          <h2 className="game-title">{game.title}</h2>
          <img src={game.thumbnail} alt={game.title} />
          <p className="game-description">{game.short_description}</p>
        </div>
      ))
    } else {
      if (currentGames.length === 0) {
        return <div className="game-unavailable">Jogo Indisponível</div>
      }

      return currentGames.map(game => (
        <div key={game.id} className="card">
          <h2 className="game-title">{game.title}</h2>
          <img src={game.thumbnail} alt={game.title} />
          <p className="game-description">{game.short_description}</p>
        </div>
      ))
    }
  }
  return (
    <div>
      {isLoading ? (
        <div>Carregando...</div>
      ) : errorMessage ? (
        <div>{errorMessage}</div>
      ) : (
        <div>
          <div className="action-menu">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={isSearchFocused ? "" : "Pesquisar"}
              onFocus={() => handleSearchFocus(true)}
              onBlur={() => handleSearchFocus(false)}
              autoComplete="off"
            />
            <select value={selectedGenre} onChange={handleGenreSelect}>
              <option value="">Todos os gêneros</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
            <button className="toggle-button" onClick={handleToggleAllGames}>
              {showAllGames ? "Voltar para Paginação" : "Mostrar Todos"}
            </button>
          </div>
          <div className="cards-container">{renderGameCards()}</div>
          {!showAllGames && (
            <div className="pagination">
              <button
                className="page-number"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Página Anterior
              </button>
              <span className="page-number">{currentPage}</span>
              <button
                className="page-number"
                onClick={handleNextPage}
                disabled={
                  currentPage === Math.ceil(games.length / gamesPerPage)
                }
              >
                Próxima Página
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

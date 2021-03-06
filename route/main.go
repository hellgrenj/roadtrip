package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/hellgrenj/bf-tsm/pkg/routes"
)

// Server is the http server struct
type Server struct {
	router *mux.Router
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	enableCors(&w)
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	s.router.ServeHTTP(w, r)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS, PUT, PATCH")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Access-Control-Allow-Methods, Authorization, X-Requested-With")
}

func (s *Server) decode(w http.ResponseWriter, r *http.Request, v interface{}) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1048576) // request body max 1 MB
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(v); err != nil {
		return err
	}
	return nil
}

// Result conains the optimal route and the time it took to calculate this route
type Result struct {
	Route                routes.OptimalRoute
	NumberOfPermutations int
	ExecutionTimeInMs    int64
}

func (s *Server) optimalRoute(w http.ResponseWriter, r *http.Request) {
	var points []routes.Point

	if err := s.decode(w, r, &points); err != nil {
		fmt.Fprintf(w, "Failed to parse request payload %v", err)
		return
	}
	fmt.Printf("Received points %v\n", points)
	if len(points) > 11 {
		http.Error(w, "max 11 points allowed", http.StatusBadRequest)
		return
	}
	start := time.Now()
	optimal := routes.OptimalPath(points)
	elapsed := time.Since(start)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&Result{Route: optimal, NumberOfPermutations: optimal.NumberOfPermutations, ExecutionTimeInMs: elapsed.Milliseconds()})
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "up and running")
}

func handleError(w http.ResponseWriter, err error) {
	w.WriteHeader(500)
	log.Println(err.Error())
	log.Fatal("Something went wrong!")
}

// NewServer returns a new http server
func NewServer() *Server {
	s := &Server{router: mux.NewRouter()}
	s.router.HandleFunc("/optimalroute", s.optimalRoute).Methods("POST")
	s.router.HandleFunc("/health", s.health).Methods("GET")
	return s
}

func main() {
	defer func() {
		if err := recover(); err != nil {
			fmt.Fprintf(os.Stderr, "Exception: %v\n", err)
			os.Exit(1)
		}
	}()
	s := NewServer()
	fmt.Println("routes service running on port 8282")
	http.ListenAndServe(":8282", s)
}

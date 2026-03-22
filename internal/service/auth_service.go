package service

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"inventory-management/internal/repository"
)

type AuthService struct {
	q         *repository.Queries
	jwtSecret string
}

func NewAuthService(q *repository.Queries, jwtSecret string) *AuthService {
	return &AuthService{
		q:         q,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Login(ctx context.Context, username, password string) (string, error) {
	user, err := s.q.GetUserByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", errors.New("invalid credentials")
		}
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signed, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}

	return signed, nil
}

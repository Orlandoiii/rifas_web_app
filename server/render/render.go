package render

import (
	"bytes"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"net/http"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/tdewolff/minify/v2"
)

type Service struct {
	viewDir   string
	templates *template.Template
	minifier  *minify.M
}

func Dict(values ...any) (map[string]any, error) {
	if len(values)%2 != 0 {
		return nil, fmt.Errorf("dict called with odd number of args")
	}
	m := make(map[string]any, len(values)/2)
	for i := 0; i < len(values); i += 2 {
		key, ok := values[i].(string)
		if !ok {
			return nil, fmt.Errorf("dict keys must be strings")
		}
		m[key] = values[i+1]
	}
	return m, nil
}
func Slice(values ...any) []any { return values }

var dataKeyRe = regexp.MustCompile(`^[A-Za-z0-9_.:\-]+$`)

func BuildDataAttrsHTML(data any) template.HTMLAttr {
	// admite map[string]any y map[string]string
	if data == nil {
		return template.HTMLAttr("")
	}
	var m map[string]string
	switch mm := data.(type) {
	case map[string]string:
		m = mm
	case map[string]any:
		m = make(map[string]string, len(mm))
		for k, v := range mm {
			switch x := v.(type) {
			case string:
				m[k] = x
			case fmt.Stringer:
				m[k] = x.String()
			case int, int8, int16, int32, int64:
				m[k] = fmt.Sprintf("%d", x)
			case uint, uint8, uint16, uint32, uint64:
				m[k] = fmt.Sprintf("%d", x)
			case float32, float64:
				m[k] = fmt.Sprintf("%v", x)
			case bool:
				if x {
					m[k] = "true"
				} else {
					m[k] = "false"
				}
			default:
				// ignora tipos no convertibles
			}
		}
	default:
		return template.HTMLAttr("")
	}

	if len(m) == 0 {
		return template.HTMLAttr("")
	}

	// ordena para estabilidad
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var b strings.Builder
	for _, k := range keys {
		v := m[k]
		// si te pasan sin prefijo, se lo agregas
		name := k
		if !strings.HasPrefix(name, "data-") {
			name = "data-" + name
		}
		// valida el sufijo después de "data-"
		suffix := strings.TrimPrefix(name, "data-")
		if !dataKeyRe.MatchString(suffix) {
			continue // salta claves no válidas
		}

		b.WriteByte(' ')
		b.WriteString(name)
		b.WriteString(`="`)
		b.WriteString(template.HTMLEscapeString(v))
		b.WriteString(`"`)
	}
	return template.HTMLAttr(b.String())
}

func Merge(a any, b any) (map[string]any, error) {
	toMap := func(v any) (map[string]any, error) {
		if v == nil {
			return map[string]any{}, nil
		}
		if m, ok := v.(map[string]any); ok {
			return m, nil
		}
		return nil, fmt.Errorf("merge expects map[string]any, got %T", v)
	}

	ma, err := toMap(a)
	if err != nil {
		return nil, err
	}
	mb, err := toMap(b)
	if err != nil {
		return nil, err
	}

	out := make(map[string]any, len(ma)+len(mb))
	for k, v := range ma {
		out[k] = v
	}
	for k, v := range mb {
		out[k] = v
	}
	return out, nil
}

func NewService(viewDir string, m *minify.M) (*Service, error) {

	log.Info().Str("view_dir", viewDir).Msg("Render/Cargando vistas")

	t := template.New("index")

	t = t.Funcs(template.FuncMap{

		"dict":      Dict,
		"slice":     Slice,
		"dataAttrs": BuildDataAttrsHTML,
		"merge":     Merge,
		"safeHTML":  func(s string) template.HTML { return template.HTML(s) },
		"renderTemplate": func(name string, data interface{}) (template.HTML, error) {
			var buf bytes.Buffer
			err := t.ExecuteTemplate(&buf, name, data)
			if err != nil {
				return "", err
			}
			return template.HTML(buf.String()), nil
		},
	})

	err := filepath.WalkDir(viewDir, func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			return nil
		}
		if strings.HasSuffix(strings.ToLower(d.Name()), ".html") {
			if _, perr := t.ParseFiles(path); perr != nil {
				return fmt.Errorf("parse template %s: %w", path, perr)
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}
	s := &Service{
		viewDir:   viewDir,
		templates: t,
		minifier:  m,
	}
	return s, nil
}

func (r *Service) Render(name string, data interface{}) (string, error) {

	var buf bytes.Buffer

	err := r.templates.ExecuteTemplate(&buf, name, data)

	if err != nil {
		return "", err
	}

	if r.minifier != nil {

		minified, err := r.minifier.Bytes("text/html", buf.Bytes())

		if err != nil {
			return "", err
		}

		return string(minified), nil
	}

	return buf.String(), nil

}

func (r *Service) RenderOnWriter(w io.Writer, name string, data interface{}) error {
	var buf bytes.Buffer
	if err := r.templates.ExecuteTemplate(&buf, name, data); err != nil {
		return err
	}

	if rw, ok := w.(http.ResponseWriter); ok {
		if rw.Header().Get("Content-Type") == "" {
			rw.Header().Set("Content-Type", "text/html; charset=utf-8")
		}
	}

	if r.minifier != nil {
		if minified, err := r.minifier.Bytes("text/html", buf.Bytes()); err == nil {
			_, writeErr := w.Write(minified)
			return writeErr
		}
	}

	_, err := w.Write(buf.Bytes())
	return err
}

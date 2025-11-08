package config

type ConfigFile struct {
	ServiceInfo `json:"ServiceInfo"`
	SslConfig   `json:"SslConfig"`
	CORSConfig  `json:"CORSConfig"`
	MockConfig  `json:"MockConfig"`
}

type ServiceInfo struct {
	Version     string `json:"Version"`
	Descripcion string `json:"Descripcion"`
	HttpPort    int    `json:"HttpPort"`
	GrpcPort    int    `json:"GrpcPort"`
}

type SslConfig struct {
	EnabledSslHttp bool   `json:"EnabledSslHttp"`
	Path           string `json:"Path"`
	PathToKey      string `json:"PathToKey"`
}

type CORSConfig struct {
	AllowedOrigins []string `json:"AllowedOrigins"`
}

type MockConfig struct {
	Enabled bool `json:"Enabled"`
}

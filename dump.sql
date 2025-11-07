--
-- PostgreSQL database dump
--

\restrict 3xFe89zFvE9P6yuGD31LIiJsqUjSFsJR08aitBcLE4RKO09pU6MOXleBcYmjKzs

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: atividades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.atividades (
    atividade_id integer NOT NULL,
    projeto_id integer NOT NULL,
    nome_atividade character varying(100) NOT NULL,
    descr_atividade text NOT NULL,
    data_prevista_inicio timestamp without time zone DEFAULT date_trunc('second'::text, CURRENT_TIMESTAMP),
    data_prevista_fim timestamp without time zone DEFAULT date_trunc('second'::text, CURRENT_TIMESTAMP),
    status boolean DEFAULT true
);


ALTER TABLE public.atividades OWNER TO postgres;

--
-- Name: atividades_atividade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.atividades_atividade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.atividades_atividade_id_seq OWNER TO postgres;

--
-- Name: atividades_atividade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.atividades_atividade_id_seq OWNED BY public.atividades.atividade_id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    cliente_id integer NOT NULL,
    nome_cliente character varying(50) NOT NULL,
    nome_contato character varying(50) NOT NULL,
    cep character varying(10),
    endereco character varying(100),
    cidade character varying(100),
    estado character(2),
    cnpj character varying(18),
    status boolean DEFAULT true,
    CONSTRAINT clientes_cep_check CHECK (((cep)::text ~ '^[0-9]{5}-?[0-9]{3}$'::text)),
    CONSTRAINT clientes_cnpj_check CHECK (((cnpj)::text ~ '^[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}/?[0-9]{4}-?[0-9]{2}$'::text)),
    CONSTRAINT clientes_estado_check CHECK ((estado ~ '^[A-Z]{2}$'::text))
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_cliente_id_seq OWNER TO postgres;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_cliente_id_seq OWNED BY public.clientes.cliente_id;


--
-- Name: colaboradores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colaboradores (
    colaborador_id integer NOT NULL,
    nome_colaborador character varying(100) NOT NULL,
    cargo character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    data_admissao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    foto bytea,
    status boolean DEFAULT true
);


ALTER TABLE public.colaboradores OWNER TO postgres;

--
-- Name: colaboradores_colaborador_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.colaboradores_colaborador_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.colaboradores_colaborador_id_seq OWNER TO postgres;

--
-- Name: colaboradores_colaborador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.colaboradores_colaborador_id_seq OWNED BY public.colaboradores.colaborador_id;


--
-- Name: lancamentos_de_horas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lancamentos_de_horas (
    lancamento_id integer NOT NULL,
    cliente_id integer NOT NULL,
    colaborador_id integer NOT NULL,
    atividade_id integer NOT NULL,
    projeto_id integer NOT NULL,
    tipo_registro character varying(50) NOT NULL,
    justificativa character varying(255),
    data_lancamento timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hora_inicio time without time zone NOT NULL,
    hora_fim time without time zone NOT NULL,
    duracao_total interval GENERATED ALWAYS AS ((hora_fim - hora_inicio)) STORED,
    status boolean DEFAULT true,
    CONSTRAINT ck_hora CHECK ((hora_fim > hora_inicio))
);


ALTER TABLE public.lancamentos_de_horas OWNER TO postgres;

--
-- Name: lancamentos_de_horas_lancamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lancamentos_de_horas_lancamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lancamentos_de_horas_lancamento_id_seq OWNER TO postgres;

--
-- Name: lancamentos_de_horas_lancamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lancamentos_de_horas_lancamento_id_seq OWNED BY public.lancamentos_de_horas.lancamento_id;


--
-- Name: projetos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projetos (
    projeto_id integer NOT NULL,
    cliente_id integer NOT NULL,
    nome_projeto character varying(100) NOT NULL,
    descricao text NOT NULL,
    data_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_fim timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status boolean DEFAULT true
);


ALTER TABLE public.projetos OWNER TO postgres;

--
-- Name: projetos_projeto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projetos_projeto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projetos_projeto_id_seq OWNER TO postgres;

--
-- Name: projetos_projeto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projetos_projeto_id_seq OWNED BY public.projetos.projeto_id;


--
-- Name: atividades atividade_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atividades ALTER COLUMN atividade_id SET DEFAULT nextval('public.atividades_atividade_id_seq'::regclass);


--
-- Name: clientes cliente_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN cliente_id SET DEFAULT nextval('public.clientes_cliente_id_seq'::regclass);


--
-- Name: colaboradores colaborador_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colaboradores ALTER COLUMN colaborador_id SET DEFAULT nextval('public.colaboradores_colaborador_id_seq'::regclass);


--
-- Name: lancamentos_de_horas lancamento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_de_horas ALTER COLUMN lancamento_id SET DEFAULT nextval('public.lancamentos_de_horas_lancamento_id_seq'::regclass);


--
-- Name: projetos projeto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projetos ALTER COLUMN projeto_id SET DEFAULT nextval('public.projetos_projeto_id_seq'::regclass);


--
-- Data for Name: atividades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.atividades (atividade_id, projeto_id, nome_atividade, descr_atividade, data_prevista_inicio, data_prevista_fim, status) FROM stdin;
1	1	Análise de Requisitos	Coleta e documentação das necessidades do cliente	2025-10-15 09:00:00	2025-10-16 18:00:00	t
2	2	Desenvolvimento Backend	Implementação das APIs e regras de negócio	2025-10-17 08:00:00	2025-10-25 17:30:00	t
3	3	Desenvolvimento Frontend	Criação da interface do usuário e integração com backend	2025-10-18 09:00:00	2025-10-28 18:00:00	t
4	1	Análise de Requisitos	Coleta e documentação das necessidades do cliente	2025-10-15 09:00:00	2025-10-16 18:00:00	t
5	2	Desenvolvimento Backend	Implementação das APIs e regras de negócio	2025-10-17 08:00:00	2025-10-25 17:30:00	t
6	3	Desenvolvimento Frontend	Criação da interface do usuário e integração com backend	2025-10-18 09:00:00	2025-10-28 18:00:00	t
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (cliente_id, nome_cliente, nome_contato, cep, endereco, cidade, estado, cnpj, status) FROM stdin;
1	Comercial Alfa Ltda	Marcos Silva	01001-000	Rua das Flores, 120	São Paulo	SP	12.345.678/0001-90	t
2	Mercado Beta EIRELI	Ana Paula Rocha	30140-070	Av. Afonso Pena, 850	Belo Horizonte	MG	98.765.432/0001-55	t
3	Construtora Gama S.A.	Carlos Menezes	70040-010	SCS Quadra 3 Bloco A	Brasília	DF	45.678.912/0001-22	t
4	Tech Delta Ltda	Fernanda Souza	40010-000	Rua Chile, 50	Salvador	BA	23.456.789/0001-88	t
5	Hotel Épsilon	Ricardo Tavares	88010-000	Av. Beira-Mar Norte, 200	Florianópolis	SC	67.890.123/0001-33	t
6	Restaurante Zeta	Juliana Andrade	80010-000	Rua XV de Novembro, 99	Curitiba	PR	89.012.345/0001-77	f
7	Editora Ômega	Patrícia Lima	60025-040	Av. Santos Dumont, 250	Fortaleza	CE	11.223.344/0001-66	t
8	Transportes Sigma	Eduardo Costa	90010-001	Av. Borges de Medeiros, 1000	Porto Alegre	RS	55.666.777/0001-99	t
9	Loja Kappa	Luciana Martins	64000-120	Rua Coelho Rodrigues, 300	Teresina	PI	77.888.999/0001-11	t
10	Agropecuária Lambda	João Batista	69005-040	Av. Eduardo Ribeiro, 80	Manaus	AM	33.444.555/0001-44	f
\.


--
-- Data for Name: colaboradores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colaboradores (colaborador_id, nome_colaborador, cargo, email, data_admissao, foto, status) FROM stdin;
1	Ana Beatriz Silva	Analista de Sistemas	ana.silva@empresa.com	2023-08-15 09:00:00	\N	t
2	Carlos Eduardo Souza	Desenvolvedor Backend	carlos.souza@empresa.com	2024-01-10 09:00:00	\N	t
3	Fernanda Oliveira	Designer UX/UI	fernanda.oliveira@empresa.com	2024-03-22 09:00:00	\N	t
4	João Pedro Ramos	Gerente de Projetos	joao.ramos@empresa.com	2022-11-05 09:00:00	\N	t
5	Luciana Andrade	Testadora de Software	luciana.andrade@empresa.com	2024-05-12 09:00:00	\N	t
\.


--
-- Data for Name: lancamentos_de_horas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lancamentos_de_horas (lancamento_id, cliente_id, colaborador_id, atividade_id, projeto_id, tipo_registro, justificativa, data_lancamento, hora_inicio, hora_fim, status) FROM stdin;
4	1	1	2	1	Trabalho	Desenvolvimento de módulo de login	2025-10-13 09:00:00	09:00:00	12:00:00	t
5	1	1	3	1	Trabalho	Correção de bugs e testes unitários	2025-10-13 13:00:00	13:00:00	17:30:00	t
6	1	1	4	1	Reunião	Revisão de progresso com o cliente	2025-10-14 09:00:00	09:00:00	10:30:00	t
\.


--
-- Data for Name: projetos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projetos (projeto_id, cliente_id, nome_projeto, descricao, data_inicio, data_fim, status) FROM stdin;
1	1	Sistema de Gestão Comercial	Desenvolvimento de um sistema ERP para controle de vendas e estoque	2025-10-01 08:00:00	2025-12-15 18:00:00	t
2	2	Portal de Clientes	Criação de um portal online para autoatendimento de clientes	2025-09-20 09:00:00	2025-11-30 18:00:00	t
3	3	Aplicativo Mobile	Desenvolvimento de um aplicativo para Android e iOS	2025-08-10 10:00:00	2025-12-01 17:00:00	t
\.


--
-- Name: atividades_atividade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.atividades_atividade_id_seq', 10, true);


--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_cliente_id_seq', 10, true);


--
-- Name: colaboradores_colaborador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colaboradores_colaborador_id_seq', 5, true);


--
-- Name: lancamentos_de_horas_lancamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lancamentos_de_horas_lancamento_id_seq', 6, true);


--
-- Name: projetos_projeto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projetos_projeto_id_seq', 3, true);


--
-- Name: atividades atividades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atividades
    ADD CONSTRAINT atividades_pkey PRIMARY KEY (atividade_id);


--
-- Name: clientes clientes_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_cnpj_key UNIQUE (cnpj);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (cliente_id);


--
-- Name: colaboradores colaboradores_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colaboradores
    ADD CONSTRAINT colaboradores_email_key UNIQUE (email);


--
-- Name: colaboradores colaboradores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colaboradores
    ADD CONSTRAINT colaboradores_pkey PRIMARY KEY (colaborador_id);


--
-- Name: lancamentos_de_horas lancamentos_de_horas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_de_horas
    ADD CONSTRAINT lancamentos_de_horas_pkey PRIMARY KEY (lancamento_id);


--
-- Name: projetos projetos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projetos
    ADD CONSTRAINT projetos_pkey PRIMARY KEY (projeto_id);


--
-- Name: atividades fk_atividade_projeto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.atividades
    ADD CONSTRAINT fk_atividade_projeto FOREIGN KEY (projeto_id) REFERENCES public.projetos(projeto_id) ON DELETE CASCADE;


--
-- Name: lancamentos_de_horas fk_lancamento_atividade; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_de_horas
    ADD CONSTRAINT fk_lancamento_atividade FOREIGN KEY (atividade_id) REFERENCES public.atividades(atividade_id) ON DELETE CASCADE;


--
-- Name: lancamentos_de_horas fk_lancamento_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_de_horas
    ADD CONSTRAINT fk_lancamento_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON DELETE CASCADE;


--
-- Name: lancamentos_de_horas fk_lancamento_colaborador; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_de_horas
    ADD CONSTRAINT fk_lancamento_colaborador FOREIGN KEY (colaborador_id) REFERENCES public.colaboradores(colaborador_id) ON DELETE CASCADE;


--
-- Name: lancamentos_de_horas fk_lancamento_projeto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lancamentos_de_horas
    ADD CONSTRAINT fk_lancamento_projeto FOREIGN KEY (projeto_id) REFERENCES public.projetos(projeto_id) ON DELETE CASCADE;


--
-- Name: projetos fk_projeto_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projetos
    ADD CONSTRAINT fk_projeto_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3xFe89zFvE9P6yuGD31LIiJsqUjSFsJR08aitBcLE4RKO09pU6MOXleBcYmjKzs


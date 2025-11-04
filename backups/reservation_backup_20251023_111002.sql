--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Debian 14.17-1.pgdg120+1)
-- Dumped by pg_dump version 14.17 (Debian 14.17-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'CANCELLED',
    'NO_SHOW',
    'COMPLETED',
    'PENDING_PAYMENT',
    'PARTIALLY_PAID'
);


ALTER TYPE public."ReservationStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: add_on_service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.add_on_service (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    duration integer,
    "serviceId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public.add_on_service OWNER TO postgres;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    city text,
    state text,
    "zipCode" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- Name: organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization (
    id text NOT NULL,
    name text NOT NULL,
    subdomain text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.organization OWNER TO postgres;

--
-- Name: pet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pet (
    id text NOT NULL,
    name text NOT NULL,
    breed text,
    size text,
    weight double precision,
    "birthDate" timestamp(3) without time zone,
    notes text,
    "customerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public.pet OWNER TO postgres;

--
-- Name: reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation (
    id text NOT NULL,
    "orderNumber" text,
    "customerId" text NOT NULL,
    "petId" text NOT NULL,
    "resourceId" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status public."ReservationStatus" DEFAULT 'CONFIRMED'::public."ReservationStatus" NOT NULL,
    "suiteType" text NOT NULL,
    price double precision,
    deposit double precision,
    balance double precision,
    notes text,
    "staffNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public.reservation OWNER TO postgres;

--
-- Name: reservation_add_on; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_add_on (
    id text NOT NULL,
    "reservationId" text NOT NULL,
    "addOnId" text NOT NULL,
    price double precision NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public.reservation_add_on OWNER TO postgres;

--
-- Name: resource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text,
    capacity integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public.resource OWNER TO postgres;

--
-- Name: service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    duration integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public.service OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ef70e40e-02d6-45e4-beec-3fc9e7cddb51	ac3b0025c3ac2dca976d1ab405b1dde4dd06cfdb80c3c03b454bca0fd3293bd4	2025-07-25 22:44:30.992122+00	20250718191706_initial_setup	\N	\N	2025-07-25 22:44:30.953023+00	1
\.


--
-- Data for Name: add_on_service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.add_on_service (id, name, description, price, duration, "serviceId", "isActive", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (id, "firstName", "lastName", email, phone, address, city, state, "zipCode", notes, "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization (id, name, subdomain, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pet (id, name, breed, size, weight, "birthDate", notes, "customerId", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: reservation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation (id, "orderNumber", "customerId", "petId", "resourceId", "startDate", "endDate", status, "suiteType", price, deposit, balance, notes, "staffNotes", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: reservation_add_on; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation_add_on (id, "reservationId", "addOnId", price, notes, "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource (id, name, type, description, capacity, "isActive", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service (id, name, description, price, duration, "isActive", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: add_on_service add_on_service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.add_on_service
    ADD CONSTRAINT add_on_service_pkey PRIMARY KEY (id);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: pet pet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet
    ADD CONSTRAINT pet_pkey PRIMARY KEY (id);


--
-- Name: reservation_add_on reservation_add_on_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_add_on
    ADD CONSTRAINT reservation_add_on_pkey PRIMARY KEY (id);


--
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (id);


--
-- Name: resource resource_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource
    ADD CONSTRAINT resource_pkey PRIMARY KEY (id);


--
-- Name: service service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT service_pkey PRIMARY KEY (id);


--
-- Name: add_on_service_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "add_on_service_organizationId_idx" ON public.add_on_service USING btree ("organizationId");


--
-- Name: add_on_service_organizationId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "add_on_service_organizationId_isActive_idx" ON public.add_on_service USING btree ("organizationId", "isActive");


--
-- Name: add_on_service_serviceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "add_on_service_serviceId_idx" ON public.add_on_service USING btree ("serviceId");


--
-- Name: customer_organizationId_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customer_organizationId_email_idx" ON public.customer USING btree ("organizationId", email);


--
-- Name: customer_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customer_organizationId_idx" ON public.customer USING btree ("organizationId");


--
-- Name: customer_organizationId_lastName_firstName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customer_organizationId_lastName_firstName_idx" ON public.customer USING btree ("organizationId", "lastName", "firstName");


--
-- Name: organization_subdomain_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX organization_subdomain_idx ON public.organization USING btree (subdomain);


--
-- Name: organization_subdomain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX organization_subdomain_key ON public.organization USING btree (subdomain);


--
-- Name: pet_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pet_customerId_idx" ON public.pet USING btree ("customerId");


--
-- Name: pet_organizationId_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pet_organizationId_customerId_idx" ON public.pet USING btree ("organizationId", "customerId");


--
-- Name: pet_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pet_organizationId_idx" ON public.pet USING btree ("organizationId");


--
-- Name: reservation_add_on_addOnId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_add_on_addOnId_idx" ON public.reservation_add_on USING btree ("addOnId");


--
-- Name: reservation_add_on_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_add_on_organizationId_idx" ON public.reservation_add_on USING btree ("organizationId");


--
-- Name: reservation_add_on_reservationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_add_on_reservationId_idx" ON public.reservation_add_on USING btree ("reservationId");


--
-- Name: reservation_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_customerId_idx" ON public.reservation USING btree ("customerId");


--
-- Name: reservation_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_orderNumber_idx" ON public.reservation USING btree ("orderNumber");


--
-- Name: reservation_orderNumber_organizationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reservation_orderNumber_organizationId_key" ON public.reservation USING btree ("orderNumber", "organizationId");


--
-- Name: reservation_organizationId_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_organizationId_customerId_idx" ON public.reservation USING btree ("organizationId", "customerId");


--
-- Name: reservation_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_organizationId_idx" ON public.reservation USING btree ("organizationId");


--
-- Name: reservation_organizationId_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_organizationId_startDate_endDate_idx" ON public.reservation USING btree ("organizationId", "startDate", "endDate");


--
-- Name: reservation_organizationId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_organizationId_status_idx" ON public.reservation USING btree ("organizationId", status);


--
-- Name: reservation_petId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_petId_idx" ON public.reservation USING btree ("petId");


--
-- Name: reservation_resourceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reservation_resourceId_idx" ON public.reservation USING btree ("resourceId");


--
-- Name: resource_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "resource_organizationId_idx" ON public.resource USING btree ("organizationId");


--
-- Name: resource_organizationId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "resource_organizationId_isActive_idx" ON public.resource USING btree ("organizationId", "isActive");


--
-- Name: resource_organizationId_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "resource_organizationId_type_idx" ON public.resource USING btree ("organizationId", type);


--
-- Name: service_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_organizationId_idx" ON public.service USING btree ("organizationId");


--
-- Name: service_organizationId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "service_organizationId_isActive_idx" ON public.service USING btree ("organizationId", "isActive");


--
-- Name: pet pet_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pet
    ADD CONSTRAINT "pet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservation_add_on reservation_add_on_addOnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_add_on
    ADD CONSTRAINT "reservation_add_on_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES public.add_on_service(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservation_add_on reservation_add_on_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_add_on
    ADD CONSTRAINT "reservation_add_on_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public.reservation(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservation reservation_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT "reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservation reservation_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT "reservation_petId_fkey" FOREIGN KEY ("petId") REFERENCES public.pet(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservation reservation_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT "reservation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public.resource(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


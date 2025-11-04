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
-- Name: AvailabilityStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AvailabilityStatus" AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'MAINTENANCE',
    'OUT_OF_SERVICE'
);


ALTER TYPE public."AvailabilityStatus" OWNER TO postgres;

--
-- Name: ContactMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContactMethod" AS ENUM (
    'EMAIL',
    'SMS',
    'BOTH',
    'NONE'
);


ALTER TYPE public."ContactMethod" OWNER TO postgres;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'UNKNOWN'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'SENT',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CASH',
    'CHECK',
    'BANK_TRANSFER',
    'STORE_CREDIT',
    'GIFT_CARD'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PetType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PetType" AS ENUM (
    'DOG',
    'CAT',
    'BIRD',
    'RABBIT',
    'REPTILE',
    'OTHER'
);


ALTER TYPE public."PetType" OWNER TO postgres;

--
-- Name: PlayGroupType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlayGroupType" AS ENUM (
    'SMALL_DOGS',
    'MEDIUM_DOGS',
    'LARGE_DOGS',
    'HIGH_ENERGY',
    'LOW_ENERGY',
    'PUPPIES',
    'SENIORS',
    'SPECIAL_NEEDS'
);


ALTER TYPE public."PlayGroupType" OWNER TO postgres;

--
-- Name: PriceRuleType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PriceRuleType" AS ENUM (
    'DAY_OF_WEEK',
    'MULTI_DAY',
    'MULTI_PET',
    'SEASONAL',
    'PROMOTIONAL',
    'CUSTOM'
);


ALTER TYPE public."PriceRuleType" OWNER TO postgres;

--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'CANCELLED',
    'NO_SHOW',
    'COMPLETED'
);


ALTER TYPE public."ReservationStatus" OWNER TO postgres;

--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ResourceType" AS ENUM (
    'KENNEL',
    'RUN',
    'SUITE',
    'STANDARD_SUITE',
    'STANDARD_PLUS_SUITE',
    'VIP_SUITE',
    'PLAY_AREA',
    'OUTDOOR_PLAY_YARD',
    'PRIVATE_PLAY_AREA',
    'GROOMING_TABLE',
    'BATHING_STATION',
    'DRYING_STATION',
    'TRAINING_ROOM',
    'AGILITY_COURSE',
    'GROOMER',
    'TRAINER',
    'ATTENDANT',
    'BATHER',
    'OTHER'
);


ALTER TYPE public."ResourceType" OWNER TO postgres;

--
-- Name: ScheduleStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ScheduleStatus" AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."ScheduleStatus" OWNER TO postgres;

--
-- Name: ServiceCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceCategory" AS ENUM (
    'DAYCARE',
    'BOARDING',
    'GROOMING',
    'TRAINING',
    'OTHER'
);


ALTER TYPE public."ServiceCategory" OWNER TO postgres;

--
-- Name: TimeOffStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TimeOffStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'DENIED',
    'CANCELLED'
);


ALTER TYPE public."TimeOffStatus" OWNER TO postgres;

--
-- Name: TimeOffType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TimeOffType" AS ENUM (
    'VACATION',
    'SICK',
    'PERSONAL',
    'BEREAVEMENT',
    'JURY_DUTY',
    'OTHER'
);


ALTER TYPE public."TimeOffType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AddOnService; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AddOnService" (
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


ALTER TABLE public."AddOnService" OWNER TO postgres;

--
-- Name: Customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customer" (
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


ALTER TABLE public."Customer" OWNER TO postgres;

--
-- Name: Pet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pet" (
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


ALTER TABLE public."Pet" OWNER TO postgres;

--
-- Name: Reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reservation" (
    id text NOT NULL,
    "orderNumber" text,
    "customerId" text NOT NULL,
    "petId" text NOT NULL,
    "resourceId" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status text DEFAULT 'CONFIRMED'::text NOT NULL,
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


ALTER TABLE public."Reservation" OWNER TO postgres;

--
-- Name: ReservationAddOn; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReservationAddOn" (
    id text NOT NULL,
    "reservationId" text NOT NULL,
    "addOnId" text NOT NULL,
    price double precision NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL
);


ALTER TABLE public."ReservationAddOn" OWNER TO postgres;

--
-- Name: Resource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Resource" (
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


ALTER TABLE public."Resource" OWNER TO postgres;

--
-- Name: Service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Service" (
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


ALTER TABLE public."Service" OWNER TO postgres;

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
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id text NOT NULL,
    "checkInId" text NOT NULL,
    "activityType" text NOT NULL,
    notes text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "recordedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: addon_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addon_services (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price double precision NOT NULL,
    duration integer,
    "serviceId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.addon_services OWNER TO postgres;

--
-- Name: check_ins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.check_ins (
    id text NOT NULL,
    "petId" text NOT NULL,
    "reservationId" text,
    "checkInTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "checkOutTime" timestamp(3) without time zone,
    "checkInNotes" text,
    "checkOutNotes" text,
    "checkInBy" text,
    "checkOutBy" text,
    "belongingsChecklist" jsonb,
    "foodProvided" boolean DEFAULT false NOT NULL,
    "medicationGiven" boolean DEFAULT false NOT NULL,
    "medicationNotes" text,
    "behaviorDuringStay" text,
    "photosTaken" boolean DEFAULT false NOT NULL,
    "photosShared" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.check_ins OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id text NOT NULL,
    email text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    "alternatePhone" text,
    address text,
    city text,
    state text,
    "zipCode" text,
    notes text,
    "portalEnabled" boolean DEFAULT true NOT NULL,
    "preferredContact" public."ContactMethod" DEFAULT 'EMAIL'::public."ContactMethod" NOT NULL,
    "emergencyContact" text,
    "emergencyPhone" text,
    "vatTaxId" text,
    "referralSource" text,
    tags text[] DEFAULT ARRAY[]::text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    "customerId" text NOT NULL,
    title text NOT NULL,
    description text,
    "fileUrl" text NOT NULL,
    "fileType" text NOT NULL,
    "fileSize" integer NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[],
    uploaded timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_line_items (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "unitPrice" double precision NOT NULL,
    amount double precision NOT NULL,
    taxable boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoice_line_items OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "customerId" text NOT NULL,
    "reservationId" text,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    subtotal double precision NOT NULL,
    "taxRate" double precision DEFAULT 0 NOT NULL,
    "taxAmount" double precision DEFAULT 0 NOT NULL,
    discount double precision DEFAULT 0 NOT NULL,
    total double precision NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_records (
    id text NOT NULL,
    "petId" text NOT NULL,
    "recordType" text NOT NULL,
    "recordDate" timestamp(3) without time zone NOT NULL,
    "expirationDate" timestamp(3) without time zone,
    description text NOT NULL,
    veterinarian text,
    "fileUrl" text,
    verified boolean DEFAULT false NOT NULL,
    "verifiedBy" text,
    "verifiedDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.medical_records OWNER TO postgres;

--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "emailNotifications" boolean DEFAULT true NOT NULL,
    "smsNotifications" boolean DEFAULT false NOT NULL,
    "pushNotifications" boolean DEFAULT false NOT NULL,
    "marketingEmails" boolean DEFAULT true NOT NULL,
    "appointmentReminders" boolean DEFAULT true NOT NULL,
    "checkinNotifications" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "customerId" text NOT NULL,
    amount double precision NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "transactionId" text,
    "paymentDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "gatewayResponse" jsonb,
    "refundedAmount" double precision DEFAULT 0 NOT NULL,
    "refundReason" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: pets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pets (
    id text NOT NULL,
    name text NOT NULL,
    type public."PetType" NOT NULL,
    breed text,
    color text,
    birthdate timestamp(3) without time zone,
    weight double precision,
    gender public."Gender",
    "isNeutered" boolean DEFAULT false NOT NULL,
    "microchipNumber" text,
    "rabiesTagNumber" text,
    "specialNeeds" text,
    "foodNotes" text,
    "medicationNotes" text,
    "behaviorNotes" text,
    allergies text,
    "idealPlayGroup" public."PlayGroupType",
    "vaccinationStatus" jsonb,
    "vaccineExpirations" jsonb,
    "vetName" text,
    "vetPhone" text,
    "profilePhoto" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "lastCheckIn" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customerId" text NOT NULL
);


ALTER TABLE public.pets OWNER TO postgres;

--
-- Name: price_rule_service_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_rule_service_categories (
    id text NOT NULL,
    "priceRuleId" text NOT NULL,
    "serviceCategory" public."ServiceCategory" NOT NULL
);


ALTER TABLE public.price_rule_service_categories OWNER TO postgres;

--
-- Name: price_rule_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_rule_services (
    id text NOT NULL,
    "priceRuleId" text NOT NULL,
    "serviceId" text NOT NULL
);


ALTER TABLE public.price_rule_services OWNER TO postgres;

--
-- Name: price_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_rules (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "ruleType" public."PriceRuleType" NOT NULL,
    "discountType" public."DiscountType" NOT NULL,
    "discountValue" double precision NOT NULL,
    "minQuantity" integer,
    "maxQuantity" integer,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "daysOfWeek" text,
    "isActive" boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 10 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_rules OWNER TO postgres;

--
-- Name: reservation_addons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation_addons (
    id text NOT NULL,
    "reservationId" text NOT NULL,
    "addOnId" text NOT NULL,
    price double precision NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reservation_addons OWNER TO postgres;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    status public."ReservationStatus" DEFAULT 'PENDING'::public."ReservationStatus" NOT NULL,
    notes text,
    "staffNotes" text,
    "checkInWindow" integer,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "recurringPattern" text,
    "preChecked" boolean DEFAULT false NOT NULL,
    "checkInDate" timestamp(3) without time zone,
    "checkOutDate" timestamp(3) without time zone,
    "earlyDropOff" boolean DEFAULT false NOT NULL,
    "latePickup" boolean DEFAULT false NOT NULL,
    "customPickupPerson" text,
    "confirmedBy" text,
    "cancelReason" text,
    "cancelDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "customerId" text NOT NULL,
    "petId" text NOT NULL,
    "serviceId" text NOT NULL,
    "resourceId" text,
    "staffAssignedId" text,
    "orderNumber" text
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: resource_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resource_availability (
    id text NOT NULL,
    "resourceId" text NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    status public."AvailabilityStatus" NOT NULL,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.resource_availability OWNER TO postgres;

--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id text NOT NULL,
    name text NOT NULL,
    type public."ResourceType" NOT NULL,
    description text,
    capacity integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    attributes jsonb,
    availability text,
    location text,
    "maintenanceSchedule" text,
    "lastCleanedAt" timestamp(3) without time zone,
    "maintenanceStatus" text,
    "suiteNumber" integer
);


ALTER TABLE public.resources OWNER TO postgres;

--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    duration integer NOT NULL,
    price double precision NOT NULL,
    color text,
    "serviceCategory" public."ServiceCategory" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "requiresStaff" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "capacityLimit" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    role text NOT NULL,
    "workSchedule" jsonb,
    specialties text[] DEFAULT ARRAY[]::text[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    department text,
    "hireDate" timestamp(3) without time zone,
    "lastLogin" timestamp(3) without time zone,
    password text NOT NULL,
    "position" text,
    "resetToken" text,
    "resetTokenExpiry" timestamp(3) without time zone,
    address text,
    city text,
    state text,
    "zipCode" text
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_availability (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "isRecurring" boolean DEFAULT true NOT NULL,
    "effectiveFrom" timestamp(3) without time zone,
    "effectiveUntil" timestamp(3) without time zone,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.staff_availability OWNER TO postgres;

--
-- Name: staff_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_schedules (
    id text NOT NULL,
    "staffId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    status public."ScheduleStatus" DEFAULT 'SCHEDULED'::public."ScheduleStatus" NOT NULL,
    notes text,
    location text,
    role text,
    "createdById" text,
    "updatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "startingLocation" text
);


ALTER TABLE public.staff_schedules OWNER TO postgres;

--
-- Name: staff_time_off; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_time_off (
    id text NOT NULL,
    "staffId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    type public."TimeOffType" NOT NULL,
    status public."TimeOffStatus" DEFAULT 'PENDING'::public."TimeOffStatus" NOT NULL,
    reason text,
    notes text,
    "approvedById" text,
    "approvedDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.staff_time_off OWNER TO postgres;

--
-- Data for Name: AddOnService; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AddOnService" (id, name, description, price, duration, "serviceId", "isActive", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customer" (id, "firstName", "lastName", email, phone, address, city, state, "zipCode", notes, "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: Pet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pet" (id, name, breed, size, weight, "birthDate", notes, "customerId", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: Reservation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reservation" (id, "orderNumber", "customerId", "petId", "resourceId", "startDate", "endDate", status, "suiteType", price, deposit, balance, notes, "staffNotes", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: ReservationAddOn; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReservationAddOn" (id, "reservationId", "addOnId", price, notes, "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: Resource; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Resource" (id, name, type, description, capacity, "isActive", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Service" (id, name, description, price, duration, "isActive", "createdAt", "updatedAt", "organizationId") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
fd73b850-6d2b-4683-ac25-1b1a9bb3a6b7	5dc5618df9ecb91f4b21b01923465b3021d8b882c9d470c66ffefe4ab94bb459	2025-07-18 19:17:39.235081+00	20250414001545_init	\N	\N	2025-07-18 19:17:39.187953+00	1
94aed3a9-9032-4ffd-b881-9b19b7876f4a	250d8870f0a8d35ed3cdb46b19dc67feebc93bda2282a0f8b4476c4f5528f2d9	2025-07-18 19:17:39.31739+00	20250512013433_add_order_number_to_reservation	\N	\N	2025-07-18 19:17:39.314972+00	1
d6f92665-379e-472e-8711-0712311a17ef	862e8e91972f5c042bc66cafde47d4c94df022f2aec7f0638cab378016552636	2025-07-18 19:17:39.241415+00	20250415052835_enhance_resource_models	\N	\N	2025-07-18 19:17:39.235985+00	1
4f8ce807-ffe1-4d98-a442-27ae4b1724c9	1cbf8792931e8ea7dbd83039d14707e9f92f1d04e1b2b5910201759e65b76f14	2025-07-18 19:17:39.257281+00	20250415160840_add_performance_indexes	\N	\N	2025-07-18 19:17:39.242299+00	1
1584c7fd-8220-454d-a1c5-44ac065c4573	7e6aceed9febb012993df75e2083a6143d8ab76f2b6f1b95e93e8c5343efb992	2025-07-18 19:17:39.259819+00	20250415161050_add_performance_indexes	\N	\N	2025-07-18 19:17:39.257955+00	1
0b3167c8-0f3e-4fc5-997d-c1334cd7662b	160fd0d7f928c8797fb0d018cffe85e619fc8583a5389bd66a254282943e1145	2025-07-18 19:17:39.319757+00	20250512154433_add_starting_location_to_staff_schedule	\N	\N	2025-07-18 19:17:39.317977+00	1
d653f56c-b559-46ac-a6a6-2ebf27684649	213c534035623af49bb6eeae4779b13d4469441df2259601d834c0c25436e2a2	2025-07-18 19:17:39.262291+00	20250416011216_make_service_category_optional	\N	\N	2025-07-18 19:17:39.260476+00	1
a0c2307d-7ce7-463b-adca-b2a650f21273	07864de203a519cca51a541596fd94735ecdaaba44f69dd4700fc3b994573970	2025-07-18 19:17:39.271654+00	20250417204218_add_suite_attributes	\N	\N	2025-07-18 19:17:39.263095+00	1
b2e90514-7850-47f8-b078-ff477bc15793	54527af4f503830be2bbf163b25bcbc7dd2c917597c0295e5d22c17add01dba5	2025-07-18 19:17:39.274057+00	20250417212923_ensure_suite_fields	\N	\N	2025-07-18 19:17:39.272274+00	1
bf4f7ba8-821e-400d-94ed-a5496102ae6b	f6b1f03927c87848692b39d83cb2b37c68059cbb1e47ec7fa8c2340e14c83092	2025-07-18 19:17:39.277528+00	20250427190527_add_staff_auth_fields	\N	\N	2025-07-18 19:17:39.27478+00	1
4ab988c4-627b-46c0-b2a2-365b82c43ac8	86d13540f2c7fd5f197de5e2d68e5c6d997f106c7d7625922d7092369dc72086	2025-07-18 19:17:39.280321+00	20250427194504_add_address_to_staff	\N	\N	2025-07-18 19:17:39.278285+00	1
762813ea-8ff2-4e5c-90bb-3d1f8a61e2f4	b7384ab5e152f076d567e5ca25a8fd0405a11c34b3a8bf20bcc7fdcbd466e5bd	2025-07-18 19:17:39.28309+00	20250427195058_add_city_state_zip_to_staff	\N	\N	2025-07-18 19:17:39.281055+00	1
a78658a6-fcb1-4fd8-bce9-ea390b999460	f97f95d8d4f6492ec5650c5b71529a36b2693c033cd4d70ac5286b2d9e66587e	2025-07-18 19:17:39.295719+00	20250429181056_add_price_rules	\N	\N	2025-07-18 19:17:39.283799+00	1
7db1a68f-5af4-4801-b2ec-e7f55c9ab76d	729eb0c8c5f129ab895bb1add8e9ccb0054b00999e35bf412d73c2fc4ce1f1f9	2025-07-18 19:17:39.307976+00	20250429204940_add_staff_availability_models	\N	\N	2025-07-18 19:17:39.296335+00	1
11ae9d05-e6be-48a9-be9e-e4626ae53e4f	46309f3bd4d5c053f0e0ef2077b69c4868ec13ed097d3c24bd5ede48e5857498	2025-07-18 19:17:39.314344+00	20250429221639_add_staff_schedule	\N	\N	2025-07-18 19:17:39.308586+00	1
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, "checkInId", "activityType", notes, "timestamp", "recordedBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: addon_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addon_services (id, name, description, price, duration, "serviceId", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: check_ins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.check_ins (id, "petId", "reservationId", "checkInTime", "checkOutTime", "checkInNotes", "checkOutNotes", "checkInBy", "checkOutBy", "belongingsChecklist", "foodProvided", "medicationGiven", "medicationNotes", "behaviorDuringStay", "photosTaken", "photosShared", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, email, "firstName", "lastName", phone, "alternatePhone", address, city, state, "zipCode", notes, "portalEnabled", "preferredContact", "emergencyContact", "emergencyPhone", "vatTaxId", "referralSource", tags, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, "customerId", title, description, "fileUrl", "fileType", "fileSize", tags, uploaded, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoice_line_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_line_items (id, "invoiceId", description, quantity, "unitPrice", amount, taxable, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, "invoiceNumber", "customerId", "reservationId", "issueDate", "dueDate", status, subtotal, "taxRate", "taxAmount", discount, total, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_records (id, "petId", "recordType", "recordDate", "expirationDate", description, veterinarian, "fileUrl", verified, "verifiedBy", "verifiedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preferences (id, "customerId", "emailNotifications", "smsNotifications", "pushNotifications", "marketingEmails", "appointmentReminders", "checkinNotifications", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "invoiceId", "customerId", amount, method, status, "transactionId", "paymentDate", "gatewayResponse", "refundedAmount", "refundReason", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: pets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pets (id, name, type, breed, color, birthdate, weight, gender, "isNeutered", "microchipNumber", "rabiesTagNumber", "specialNeeds", "foodNotes", "medicationNotes", "behaviorNotes", allergies, "idealPlayGroup", "vaccinationStatus", "vaccineExpirations", "vetName", "vetPhone", "profilePhoto", "isActive", "lastCheckIn", "createdAt", "updatedAt", "customerId") FROM stdin;
\.


--
-- Data for Name: price_rule_service_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_rule_service_categories (id, "priceRuleId", "serviceCategory") FROM stdin;
\.


--
-- Data for Name: price_rule_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_rule_services (id, "priceRuleId", "serviceId") FROM stdin;
\.


--
-- Data for Name: price_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_rules (id, name, description, "ruleType", "discountType", "discountValue", "minQuantity", "maxQuantity", "startDate", "endDate", "daysOfWeek", "isActive", priority, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reservation_addons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservation_addons (id, "reservationId", "addOnId", price, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, "startDate", "endDate", status, notes, "staffNotes", "checkInWindow", "isRecurring", "recurringPattern", "preChecked", "checkInDate", "checkOutDate", "earlyDropOff", "latePickup", "customPickupPerson", "confirmedBy", "cancelReason", "cancelDate", "createdAt", "updatedAt", "customerId", "petId", "serviceId", "resourceId", "staffAssignedId", "orderNumber") FROM stdin;
\.


--
-- Data for Name: resource_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resource_availability (id, "resourceId", "startTime", "endTime", status, reason, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resources (id, name, type, description, capacity, "isActive", notes, "createdAt", "updatedAt", attributes, availability, location, "maintenanceSchedule", "lastCleanedAt", "maintenanceStatus", "suiteNumber") FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, description, duration, price, color, "serviceCategory", "isActive", "requiresStaff", notes, "createdAt", "updatedAt", "capacityLimit") FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, "firstName", "lastName", email, phone, role, "workSchedule", specialties, "isActive", "createdAt", "updatedAt", department, "hireDate", "lastLogin", password, "position", "resetToken", "resetTokenExpiry", address, city, state, "zipCode") FROM stdin;
\.


--
-- Data for Name: staff_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_availability (id, "staffId", "dayOfWeek", "startTime", "endTime", "isRecurring", "effectiveFrom", "effectiveUntil", "isAvailable", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: staff_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_schedules (id, "staffId", date, "startTime", "endTime", status, notes, location, role, "createdById", "updatedById", "createdAt", "updatedAt", "startingLocation") FROM stdin;
\.


--
-- Data for Name: staff_time_off; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_time_off (id, "staffId", "startDate", "endDate", type, status, reason, notes, "approvedById", "approvedDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: AddOnService AddOnService_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AddOnService"
    ADD CONSTRAINT "AddOnService_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: Pet Pet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_pkey" PRIMARY KEY (id);


--
-- Name: ReservationAddOn ReservationAddOn_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReservationAddOn"
    ADD CONSTRAINT "ReservationAddOn_pkey" PRIMARY KEY (id);


--
-- Name: Reservation Reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY (id);


--
-- Name: Resource Resource_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: addon_services addon_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addon_services
    ADD CONSTRAINT addon_services_pkey PRIMARY KEY (id);


--
-- Name: check_ins check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: invoice_line_items invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- Name: price_rule_service_categories price_rule_service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule_service_categories
    ADD CONSTRAINT price_rule_service_categories_pkey PRIMARY KEY (id);


--
-- Name: price_rule_services price_rule_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule_services
    ADD CONSTRAINT price_rule_services_pkey PRIMARY KEY (id);


--
-- Name: price_rules price_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rules
    ADD CONSTRAINT price_rules_pkey PRIMARY KEY (id);


--
-- Name: reservation_addons reservation_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_addons
    ADD CONSTRAINT reservation_addons_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: resource_availability resource_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_availability
    ADD CONSTRAINT resource_availability_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: staff_availability staff_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_availability
    ADD CONSTRAINT staff_availability_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_schedules staff_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_pkey PRIMARY KEY (id);


--
-- Name: staff_time_off staff_time_off_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_time_off
    ADD CONSTRAINT staff_time_off_pkey PRIMARY KEY (id);


--
-- Name: AddOnService_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AddOnService_organizationId_idx" ON public."AddOnService" USING btree ("organizationId");


--
-- Name: AddOnService_organizationId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AddOnService_organizationId_isActive_idx" ON public."AddOnService" USING btree ("organizationId", "isActive");


--
-- Name: AddOnService_serviceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AddOnService_serviceId_idx" ON public."AddOnService" USING btree ("serviceId");


--
-- Name: Customer_organizationId_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Customer_organizationId_email_idx" ON public."Customer" USING btree ("organizationId", email);


--
-- Name: Customer_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Customer_organizationId_idx" ON public."Customer" USING btree ("organizationId");


--
-- Name: Customer_organizationId_lastName_firstName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Customer_organizationId_lastName_firstName_idx" ON public."Customer" USING btree ("organizationId", "lastName", "firstName");


--
-- Name: Pet_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Pet_customerId_idx" ON public."Pet" USING btree ("customerId");


--
-- Name: Pet_organizationId_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Pet_organizationId_customerId_idx" ON public."Pet" USING btree ("organizationId", "customerId");


--
-- Name: Pet_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Pet_organizationId_idx" ON public."Pet" USING btree ("organizationId");


--
-- Name: ReservationAddOn_addOnId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReservationAddOn_addOnId_idx" ON public."ReservationAddOn" USING btree ("addOnId");


--
-- Name: ReservationAddOn_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReservationAddOn_organizationId_idx" ON public."ReservationAddOn" USING btree ("organizationId");


--
-- Name: ReservationAddOn_reservationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReservationAddOn_reservationId_idx" ON public."ReservationAddOn" USING btree ("reservationId");


--
-- Name: Reservation_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_customerId_idx" ON public."Reservation" USING btree ("customerId");


--
-- Name: Reservation_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_orderNumber_idx" ON public."Reservation" USING btree ("orderNumber");


--
-- Name: Reservation_orderNumber_organizationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Reservation_orderNumber_organizationId_key" ON public."Reservation" USING btree ("orderNumber", "organizationId");


--
-- Name: Reservation_organizationId_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_organizationId_customerId_idx" ON public."Reservation" USING btree ("organizationId", "customerId");


--
-- Name: Reservation_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_organizationId_idx" ON public."Reservation" USING btree ("organizationId");


--
-- Name: Reservation_organizationId_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_organizationId_startDate_endDate_idx" ON public."Reservation" USING btree ("organizationId", "startDate", "endDate");


--
-- Name: Reservation_organizationId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_organizationId_status_idx" ON public."Reservation" USING btree ("organizationId", status);


--
-- Name: Reservation_petId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_petId_idx" ON public."Reservation" USING btree ("petId");


--
-- Name: Reservation_resourceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Reservation_resourceId_idx" ON public."Reservation" USING btree ("resourceId");


--
-- Name: Resource_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_organizationId_idx" ON public."Resource" USING btree ("organizationId");


--
-- Name: Resource_organizationId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_organizationId_isActive_idx" ON public."Resource" USING btree ("organizationId", "isActive");


--
-- Name: Resource_organizationId_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Resource_organizationId_type_idx" ON public."Resource" USING btree ("organizationId", type);


--
-- Name: Service_organizationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_organizationId_idx" ON public."Service" USING btree ("organizationId");


--
-- Name: Service_organizationId_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Service_organizationId_isActive_idx" ON public."Service" USING btree ("organizationId", "isActive");


--
-- Name: check_ins_pet_time_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX check_ins_pet_time_idx ON public.check_ins USING btree ("petId", "checkInTime");


--
-- Name: check_ins_time_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX check_ins_time_idx ON public.check_ins USING btree ("checkInTime");


--
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- Name: customers_email_search_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_email_search_idx ON public.customers USING btree (email);


--
-- Name: customers_name_search_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_name_search_idx ON public.customers USING btree ("firstName", "lastName");


--
-- Name: customers_phone_search_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_phone_search_idx ON public.customers USING btree (phone);


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: invoices_reservationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "invoices_reservationId_key" ON public.invoices USING btree ("reservationId");


--
-- Name: notification_preferences_customerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "notification_preferences_customerId_key" ON public.notification_preferences USING btree ("customerId");


--
-- Name: payments_customer_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_customer_date_idx ON public.payments USING btree ("customerId", "paymentDate");


--
-- Name: payments_status_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_status_date_idx ON public.payments USING btree (status, "paymentDate");


--
-- Name: pets_active_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pets_active_type_idx ON public.pets USING btree ("isActive", type);


--
-- Name: pets_customer_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pets_customer_id_idx ON public.pets USING btree ("customerId");


--
-- Name: pets_last_checkin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pets_last_checkin_idx ON public.pets USING btree ("lastCheckIn");


--
-- Name: price_rule_service_categories_priceRuleId_serviceCategory_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "price_rule_service_categories_priceRuleId_serviceCategory_key" ON public.price_rule_service_categories USING btree ("priceRuleId", "serviceCategory");


--
-- Name: price_rule_services_priceRuleId_serviceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "price_rule_services_priceRuleId_serviceId_key" ON public.price_rule_services USING btree ("priceRuleId", "serviceId");


--
-- Name: price_rules_type_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX price_rules_type_active_idx ON public.price_rules USING btree ("ruleType", "isActive");


--
-- Name: reservations_customer_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_customer_status_idx ON public.reservations USING btree ("customerId", status);


--
-- Name: reservations_date_range_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_date_range_idx ON public.reservations USING btree ("startDate", "endDate");


--
-- Name: reservations_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reservations_orderNumber_key" ON public.reservations USING btree ("orderNumber");


--
-- Name: reservations_status_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_status_date_idx ON public.reservations USING btree (status, "startDate");


--
-- Name: staff_availability_day_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_availability_day_status_idx ON public.staff_availability USING btree ("dayOfWeek", "isAvailable");


--
-- Name: staff_availability_staff_day_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_availability_staff_day_idx ON public.staff_availability USING btree ("staffId", "dayOfWeek");


--
-- Name: staff_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX staff_email_key ON public.staff USING btree (email);


--
-- Name: staff_schedules_date_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_schedules_date_status_idx ON public.staff_schedules USING btree (date, status);


--
-- Name: staff_schedules_staff_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_schedules_staff_date_idx ON public.staff_schedules USING btree ("staffId", date);


--
-- Name: staff_time_off_date_range_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_time_off_date_range_idx ON public.staff_time_off USING btree ("startDate", "endDate");


--
-- Name: staff_time_off_staff_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX staff_time_off_staff_status_idx ON public.staff_time_off USING btree ("staffId", status);


--
-- Name: Pet Pet_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReservationAddOn ReservationAddOn_addOnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReservationAddOn"
    ADD CONSTRAINT "ReservationAddOn_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES public."AddOnService"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReservationAddOn ReservationAddOn_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReservationAddOn"
    ADD CONSTRAINT "ReservationAddOn_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public."Reservation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reservation Reservation_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reservation"
    ADD CONSTRAINT "Reservation_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: activities activities_checkInId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT "activities_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES public.check_ins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: addon_services addon_services_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addon_services
    ADD CONSTRAINT "addon_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: check_ins check_ins_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT "check_ins_petId_fkey" FOREIGN KEY ("petId") REFERENCES public.pets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: check_ins check_ins_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT "check_ins_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: documents documents_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_line_items invoice_line_items_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: medical_records medical_records_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT "medical_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES public.pets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT "notification_preferences_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pets pets_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT "pets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_rule_service_categories price_rule_service_categories_priceRuleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule_service_categories
    ADD CONSTRAINT "price_rule_service_categories_priceRuleId_fkey" FOREIGN KEY ("priceRuleId") REFERENCES public.price_rules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_rule_services price_rule_services_priceRuleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule_services
    ADD CONSTRAINT "price_rule_services_priceRuleId_fkey" FOREIGN KEY ("priceRuleId") REFERENCES public.price_rules(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_rule_services price_rule_services_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rule_services
    ADD CONSTRAINT "price_rule_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservation_addons reservation_addons_addOnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_addons
    ADD CONSTRAINT "reservation_addons_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES public.addon_services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservation_addons reservation_addons_reservationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation_addons
    ADD CONSTRAINT "reservation_addons_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservations reservations_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_petId_fkey" FOREIGN KEY ("petId") REFERENCES public.pets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservations reservations_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reservations reservations_serviceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reservations reservations_staffAssignedId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT "reservations_staffAssignedId_fkey" FOREIGN KEY ("staffAssignedId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: resource_availability resource_availability_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resource_availability
    ADD CONSTRAINT "resource_availability_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: staff_availability staff_availability_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_availability
    ADD CONSTRAINT "staff_availability_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff_schedules staff_schedules_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT "staff_schedules_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: staff_time_off staff_time_off_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_time_off
    ADD CONSTRAINT "staff_time_off_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


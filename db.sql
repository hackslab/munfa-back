CREATE TABLE "admin"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "admin" ADD PRIMARY KEY("id");
CREATE TABLE "product"(
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category_id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "price" FLOAT(53) NOT NULL,
    "gender" VARCHAR(255) CHECK
        ("gender" IN('men', 'women', 'uni')) NOT NULL,
        "admin_id" UUID NOT NULL,
        "weight" FLOAT(53) NOT NULL,
        "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "product" ADD PRIMARY KEY("id");
CREATE TABLE "category"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "category" ADD PRIMARY KEY("id");
CREATE TABLE "season"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "season" ADD PRIMARY KEY("id");
CREATE TABLE "color"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "color" ADD PRIMARY KEY("id");
CREATE TABLE "product_variant"(
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "size_id" UUID NOT NULL,
    "color_id" UUID NOT NULL
);
ALTER TABLE
    "product_variant" ADD PRIMARY KEY("id");
CREATE TABLE "size"(
    "id" UUID NOT NULL,
    "size" FLOAT(53) NOT NULL
);
ALTER TABLE
    "size" ADD PRIMARY KEY("id");
CREATE TABLE "user"(
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT '0',
    "otp" INTEGER NOT NULL,
    "otp_expire" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "user" ADD PRIMARY KEY("id");
CREATE TABLE "order"(
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" VARCHAR(255) CHECK
        (
            "status" IN('pending', 'confirmed', 'rejected')
        ) NOT NULL DEFAULT 'pending',
        "total_price" FLOAT(53) NOT NULL,
        "address_id" UUID NOT NULL,
        "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "order" ADD PRIMARY KEY("id");
CREATE TABLE "order_item"(
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_variant_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL
);
ALTER TABLE
    "order_item" ADD PRIMARY KEY("id");
CREATE TABLE "address"(
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "region" VARCHAR(255) NOT NULL,
    "district" VARCHAR(255) NULL,
    "location" VARCHAR(255) NULL
);
ALTER TABLE
    "address" ADD PRIMARY KEY("id");
ALTER TABLE
    "order" ADD CONSTRAINT "order_address_id_foreign" FOREIGN KEY("address_id") REFERENCES "address"("id");
ALTER TABLE
    "order" ADD CONSTRAINT "order_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "user"("id");
ALTER TABLE
    "product" ADD CONSTRAINT "product_admin_id_foreign" FOREIGN KEY("admin_id") REFERENCES "admin"("id");
ALTER TABLE
    "order_item" ADD CONSTRAINT "order_item_product_variant_id_foreign" FOREIGN KEY("product_variant_id") REFERENCES "product_variant"("id");
ALTER TABLE
    "address" ADD CONSTRAINT "address_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "user"("id");
ALTER TABLE
    "order_item" ADD CONSTRAINT "order_item_order_id_foreign" FOREIGN KEY("order_id") REFERENCES "order"("id");
ALTER TABLE
    "product" ADD CONSTRAINT "product_category_id_foreign" FOREIGN KEY("category_id") REFERENCES "category"("id");
ALTER TABLE
    "order_item" ADD CONSTRAINT "order_item_product_variant_id_foreign" FOREIGN KEY("product_variant_id") REFERENCES "product"("id");
ALTER TABLE
    "product_variant" ADD CONSTRAINT "product_variant_color_id_foreign" FOREIGN KEY("color_id") REFERENCES "color"("id");
ALTER TABLE
    "product" ADD CONSTRAINT "product_season_id_foreign" FOREIGN KEY("season_id") REFERENCES "season"("id");
ALTER TABLE
    "size" ADD CONSTRAINT "size_size_foreign" FOREIGN KEY("size") REFERENCES "product_variant"("size_id");
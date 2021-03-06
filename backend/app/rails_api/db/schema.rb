# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_02_12_025017) do

  create_table "flashes", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "source"
    t.bigint "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "source_type", null: false
    t.index ["user_id"], name: "index_flashes_on_user_id"
  end

  create_table "nonces", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "nonce"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "posts", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "text"
    t.string "image"
    t.bigint "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "room_messages", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.bigint "room_id", null: false
    t.bigint "user_id", null: false
    t.text "text"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["room_id"], name: "index_room_messages_on_room_id"
    t.index ["user_id"], name: "index_room_messages_on_user_id"
  end

  create_table "rooms", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "sender_id"
    t.bigint "recipient_id"
    t.index ["recipient_id", "sender_id"], name: "index_rooms_on_recipient_id_and_sender_id", unique: true
    t.index ["recipient_id"], name: "index_rooms_on_recipient_id"
    t.index ["sender_id"], name: "index_rooms_on_sender_id"
  end

  create_table "user_flash_viewings", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "flash_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["flash_id"], name: "index_user_flash_viewings_on_flash_id"
    t.index ["user_id", "flash_id"], name: "index_user_flash_viewings_on_user_id_and_flash_id", unique: true
    t.index ["user_id"], name: "index_user_flash_viewings_on_user_id"
  end

  create_table "user_room_message_reads", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "room_message_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "room_id"
    t.index ["room_id"], name: "index_user_room_message_reads_on_room_id"
    t.index ["room_message_id"], name: "index_user_room_message_reads_on_room_message_id"
    t.index ["user_id", "room_message_id"], name: "index_user_room_message_reads_on_user_id_and_room_message_id", unique: true
    t.index ["user_id"], name: "index_user_room_message_reads_on_user_id"
  end

  create_table "users", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", force: :cascade do |t|
    t.string "uid"
    t.string "name"
    t.string "image"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.text "introduce"
    t.text "message"
    t.boolean "display"
    t.string "token"
    t.string "lat"
    t.string "lng"
    t.index ["lat", "lng"], name: "index_users_on_lat_and_lng"
    t.index ["uid"], name: "index_users_on_uid", unique: true
  end

  add_foreign_key "flashes", "users"
  add_foreign_key "room_messages", "rooms"
  add_foreign_key "room_messages", "users"
  add_foreign_key "rooms", "users", column: "recipient_id"
  add_foreign_key "rooms", "users", column: "sender_id"
  add_foreign_key "user_flash_viewings", "flashes"
  add_foreign_key "user_flash_viewings", "users"
  add_foreign_key "user_room_message_reads", "room_messages"
  add_foreign_key "user_room_message_reads", "users"
end

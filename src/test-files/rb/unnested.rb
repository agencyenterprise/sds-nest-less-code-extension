def first_level
  puts "First level"

  def second_level
    puts "Second level"

    def third_level
      puts "Third level"
    end

    third_level
  end

  second_level
end

first_level

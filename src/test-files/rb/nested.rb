def first_level
  puts "First level"

  def second_level
    puts "Second level"

    def third_level
      puts "Third level"

      def fourth_level
        puts "Fourth level"

        def fifth_level
          puts "Fifth level"
        end

        fifth_level
      end

      fourth_level
    end

third_level
  end

  second_level
end

first_level

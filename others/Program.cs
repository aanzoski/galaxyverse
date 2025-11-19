// Line 1
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

// Line 5
namespace MegaSimEngine
{
    // Line 7
    public class Program
    {
        // Line 9
        public static void Main(string[] args)
        {
            // Line 11
            var engine = new SimulationEngine();
            engine.Initialize();
            engine.Run();
        } // Line 14
    }

    // Line 16
    public class SimulationEngine
    {
        // Line 18
        private World world;
        private bool running;
        private EventBus eventBus;
        private SystemManager systemManager;

        // Line 23
        public void Initialize()
        {
            world = new World();
            eventBus = new EventBus();
            systemManager = new SystemManager(world, eventBus);

            world.Initialize();
            eventBus.Initialize();
            systemManager.Initialize();

            running = true;
        } // Line 34

        // Line 35
        public void Run()
        {
            int frame = 0;

            // Line 38
            while (running && frame < 100)
            {
                systemManager.Update();
                frame++;
            }
        } // Line 44
    }

    // Line 46
    public class World
    {
        // Line 48
        private Dictionary<int, Entity> entities = new Dictionary<int, Entity>();
        private int nextId = 1;

        // Line 52
        public void Initialize()
        {
            // Create sample entities
            CreateEntity(new PositionComponent(0, 0));
            CreateEntity(new PositionComponent(5, 3), new VelocityComponent(1, 1));
            CreateEntity(new PositionComponent(-4, 10), new VelocityComponent(0.5, -0.25));
        } // Line 59

        // Line 60
        public Entity CreateEntity(params IComponent[] components)
        {
            var e = new Entity(nextId++);
            foreach (var c in components)
                e.AddComponent(c);

            entities[e.Id] = e;
            return e;
        } // Line 68

        // Line 69
        public IEnumerable<Entity> GetAll()
        {
            return entities.Values;
        } // Line 72
    }

    // Line 74
    public class Entity
    {
        // Line 76
        public int Id { get; private set; }
        private Dictionary<Type, IComponent> components;

        // Line 79
        public Entity(int id)
        {
            Id = id;
            components = new Dictionary<Type, IComponent>();
        }

        // Line 84
        public void AddComponent(IComponent component)
        {
            components[component.GetType()] = component;
        } // Line 87

        // Line 88
        public T GetComponent<T>() where T : class, IComponent
        {
            if (components.TryGetValue(typeof(T), out var c))
                return c as T;
            return null;
        } // Line 93

        // Line 94
        public bool Has<T>() where T : IComponent
        {
            return components.ContainsKey(typeof(T));
        } // Line 97
    }

    // Line 99
    public interface IComponent { }

    // Line 101
    public class PositionComponent : IComponent
    {
        // Line 103
        public double X { get; set; }
        public double Y { get; set; }

        // Line 106
        public PositionComponent(double x, double y)
        {
            X = x;
            Y = y;
        }
    }

    // Line 112
    public class VelocityComponent : IComponent
    {
        // Line 114
        public double VX { get; set; }
        public double VY { get; set; }

        // Line 117
        public VelocityComponent(double vx, double vy)
        {
            VX = vx;
            VY = vy;
        }
    }

    // Line 123
    public class SystemManager
    {
        // Line 125
        private readonly World world;
        private readonly EventBus eventBus;
        private readonly List<ISystem> systems;

        // Line 129
        public SystemManager(World world, EventBus eventBus)
        {
            this.world = world;
            this.eventBus = eventBus;
            systems = new List<ISystem>();
        }

        // Line 136
        public void Initialize()
        {
            systems.Add(new MovementSystem(world));
            systems.Add(new LoggerSystem(world));
        }

        // Line 142
        public void Update()
        {
            foreach (var system in systems)
                system.Update();
        }
    }

    // Line 149
    public interface ISystem
    {
        void Update();
    }

    // Line 154
    public class MovementSystem : ISystem
    {
        // Line 156
        private readonly World world;

        // Line 158
        public MovementSystem(World world)
        {
            this.world = world;
        }

        // Line 163
        public void Update()
        {
            foreach (var e in world.GetAll())
            {
                var pos = e.GetComponent<PositionComponent>();
                var vel = e.GetComponent<VelocityComponent>();

                if (pos != null && vel != null)
                {
                    pos.X += vel.VX;
                    pos.Y += vel.VY;
                }
            }
        }
    }

    // Line 179
    public class LoggerSystem : ISystem
    {
        private readonly World world;

        // Line 183
        public LoggerSystem(World world)
        {
            this.world = world;
        }

        // Line 188
        public void Update()
        {
            foreach (var e in world.GetAll())
            {
                var pos = e.GetComponent<PositionComponent>();
                if (pos != null)
                {
                    Console.WriteLine($"Entity {e.Id} at ({pos.X:F2}, {pos.Y:F2})");
                }
            }
        }
    }

    // Line 200
    public class EventBus
    {
        // Line 202
        private Dictionary<Type, List<Delegate>> handlers;

        // Line 204
        public void Initialize()
        {
            handlers = new Dictionary<Type, List<Delegate>>();
        }

        // Line 209
        public void Subscribe<T>(Action<T> handler)
        {
            var type = typeof(T);

            if (!handlers.ContainsKey(type))
                handlers[type] = new List<Delegate>();

            handlers[type].Add(handler);
        }

        // Line 219
        public void Publish<T>(T evt)
        {
            var type = typeof(T);
            if (!handlers.ContainsKey(type))
                return;

            foreach (var d in handlers[type])
                ((Action<T>)d)(evt);
        }
    }

    // Line 231
    public class MathUtil
    {
        // Line 233
        public static double Clamp(double value, double min, double max)
        {
            if (value < min) return min;
            if (value > max) return max;
            return value;
        }

        // Line 240
        public static double Distance(double x1, double y1, double x2, double y2)
        {
            double dx = x2 - x1;
            double dy = y2 - y1;
            return Math.Sqrt(dx * dx + dy * dy);
        }

        // Line 247
        public static double Lerp(double a, double b, double t)
        {
            return a + (b - a) * t;
        }
    }

    // Line 254
    public class RandomUtil
    {
        private static Random r = new Random();

        // Line 258
        public static int Range(int min, int max)
        {
            return r.Next(min, max);
        }

        // Line 263
        public static double Range(double min, double max)
        {
            return min + r.NextDouble() * (max - min);
        }

        // Line 268
        public static bool Chance(double p)
        {
            return r.NextDouble() < p;
        }
    }

    // Line 274
    public class Timer
    {
        // Line 276
        private double elapsed;
        private double interval;

        // Line 279
        public Timer(double interval)
        {
            this.interval = interval;
            elapsed = 0;
        }

        // Line 285
        public bool Update(double dt)
        {
            elapsed += dt;
            if (elapsed >= interval)
            {
                elapsed = 0;
                return true;
            }
            return false;
        }
    }

    // Line 297
    public class Vector2
    {
        // Line 299
        public double X { get; set; }
        public double Y { get; set; }

        // Line 302
        public Vector2(double x, double y)
        {
            X = x;
            Y = y;
        }

        // Line 308
        public static Vector2 operator +(Vector2 a, Vector2 b)
        {
            return new Vector2(a.X + b.X, a.Y + b.Y);
        }

        // Line 313
        public static Vector2 operator -(Vector2 a, Vector2 b)
        {
            return new Vector2(a.X - b.X, a.Y - b.Y);
        }

        // Line 318
        public override string ToString()
        {
            return $"({X:F2}, {Y:F2})";
        }
    }

    // ---------- Continuing with more real classes ---------- //
    // LINES 321–400 CONTINUE BELOW

    // Line 321
    public class TransformComponent : IComponent
    {
        // Line 323
        public Vector2 Position { get; set; }
        public double Rotation { get; set; }

        // Line 326
        public TransformComponent(double x, double y, double rotation = 0)
        {
            Position = new Vector2(x, y);
            Rotation = rotation;
        }
    }

    // Line 333
    public class RenderComponent : IComponent
    {
        // Line 335
        public char Symbol { get; set; }

        // Line 337
        public RenderComponent(char symbol)
        {
            Symbol = symbol;
        }
    }

    // Line 343
    public class RenderSystem : ISystem
    {
        private World world;

        // Line 347
        public RenderSystem(World world)
        {
            this.world = world;
        }

        // Line 352
        public void Update()
        {
            foreach (var e in world.GetAll())
            {
                var t = e.GetComponent<TransformComponent>();
                var r = e.GetComponent<RenderComponent>();

                if (t != null && r != null)
                {
                    Console.WriteLine($"Render {e.Id}: {r.Symbol} at {t.Position}");
                }
            }
        }
    }

    // Line 368
    public class HealthComponent : IComponent
    {
        // Line 370
        public int MaxHealth { get; set; }
        public int CurrentHealth { get; set; }

        // Line 373
        public HealthComponent(int hp)
        {
            MaxHealth = hp;
            CurrentHealth = hp;
        }
    }

    // Line 380
    public class DamageEvent
    {
        // Line 382
        public int EntityId { get; set; }
        public int Amount { get; set; }

        // Line 385
        public DamageEvent(int entity, int amount)
        {
            EntityId = entity;
            Amount = amount;
        }
    }

    // Line 392
    public class HealthSystem : ISystem
    {
        private World world;
        private EventBus bus;

        // Line 396
        public HealthSystem(World world, EventBus bus)
        {
            this.world = world;
            this.bus = bus;

            bus.Subscribe<DamageEvent>(OnDamage);
        }

        // Line 403
        private void OnDamage(DamageEvent d)
        {
            foreach (var e in world.GetAll())
            {
                if (e.Id == d.EntityId)
                {
                    var h = e.GetComponent<HealthComponent>();
                    if (h != null)
                    {
                        h.CurrentHealth -= d.Amount;
                        if (h.CurrentHealth < 0)
                            h.CurrentHealth = 0;
                    }
                }
            }
        }

        // Line 420
        public void Update() { }
    }
}
